import { Express, Request, Response } from 'express';
import { User } from '../db/user';
import { Quota } from '../db/quota';
import { Helpers } from '../helpers';
import { Booking } from '../db/booking';
import { DhcpServer } from '../dhcp/dhcpServer';
import { Device } from '../db/device';

export enum BookingStatus {
    quotaExceeded, 
    cooldownRemaining,
    bookingInProgress,
    needsToBook,
    none
}

export interface MakeABookingResponse {
    userId: number;
    todaysQuota: Quota;
    totalQuotaTime: number;
    quotasIncludingRollovers: Quota[];
    pastBookings: Booking[];
    inProgressBookings: Booking[];
    pastBookingsTotalTimeMins: number;
    inProgressBookingsTotalTimeMins: number;
    cooldownRemainingMins: number;
    maxDurationOfNextBook: number;
    timeRemainingOnCurrentBooking: number;
    status: BookingStatus;
    error: string;
}

export class MakeABooking {
    static init(app: Express) {

        //get all users
        app.get('/api/makeABooking', async (req: Request, res: Response) => {
            //get ip
            if (req.socket.remoteAddress == null) {
                res.status(400).json({ error: "remote address not found"});
                return;
            }
            
            let deviceId = DhcpServer.getDeviceIdFromIP(req.socket.remoteAddress);
            let device = await Device.getById(deviceId);
            if (device == null) {
                res.status(400).json({ error: "device not found"});
                return;
            }

            let user = await User.getById(device.ownerId);
            if (user == null) {
                res.status(400).json({ error: "user not found with id " + device.ownerId});
                return;
            }

            let now = new Date();
            let today:number = now.getDay();

            //get all recent days including rollovers
            let allQuotas = (await Quota.getByGroupId(user.groupId));
            let todaysQuota = allQuotas.filter(q => q.day == today)[0];

            let includingRollovers = [];
            // work backwards from today
            for (let d = today ; d != (today+1)%7 ; d = (d+6)%7) {
                let found = allQuotas.filter(q => q.day == d)[0];
                includingRollovers.push(found);
                if (!found.rollsOver) {
                    break;
                }
            }
            if (includingRollovers.length == 7) {
                res.status(400).json({ error: "at least one day must not be a rollover day"});
                return;
            }
            
            //times and days
            let totalQuotaTime = Helpers.sum(includingRollovers.map(r => r.refreshAmount));
            let days = includingRollovers.map(r => r.day);

            //get all bookings made by user
            let numDays = days.length;
            let bookingsStarted = new Date(now.valueOf() - 86400 * (numDays - 1));
            bookingsStarted.setHours(0,0,0,0);
            let bookings =  await Booking.getByUserIdAfter(device.ownerId, bookingsStarted.valueOf());

            //split into past bookings and current
            let pastBookings = bookings.filter(b => b.endsOn < now.valueOf());
            let inProgressBookings = bookings.filter(b => b.endsOn >= now.valueOf());
            if (inProgressBookings.length > 1) {
                res.status(400).json({ error: "more than one booking is in progress. Error."});
                return;
            }
            let timeRemainingOnCurrentBooking = 0;
            if (inProgressBookings.length == 1) {
                let inProgressBooking = inProgressBookings[0];
                timeRemainingOnCurrentBooking = (inProgressBooking.endsOn - now.valueOf())/60000;
            }

            let pastBookingsTotalTimeMins = Helpers.sum(pastBookings.map(p => p.duration));
            let inProgressBookingsTotalTimeMins = Helpers.sum(inProgressBookings.map(p => (now.valueOf() - p.startsOn))) / 60000;

            //any cooldown
            let mostRecentSpentBooking = pastBookings.sort((a,b) => b.startsOn - a.startsOn)[0];
            let cooldownRemainingMins = 0;
            if (mostRecentSpentBooking) {
                let cooldownEnds = mostRecentSpentBooking.endsOn + mostRecentSpentBooking.cooldown * 60000;
                cooldownRemainingMins = (cooldownEnds - now.valueOf()) / 60000;
                if (cooldownRemainingMins < 0) cooldownRemainingMins = 0;
            }

            //max booking duration 
            let maxDurationOfNextBook = totalQuotaTime - pastBookingsTotalTimeMins - inProgressBookingsTotalTimeMins;
            maxDurationOfNextBook = Math.min(maxDurationOfNextBook, todaysQuota.maxDuration);
            if (maxDurationOfNextBook < 0) maxDurationOfNextBook = 0;

            //status
            let status = BookingStatus.none;
            if (inProgressBookings.length > 0) {
                status = BookingStatus.bookingInProgress;
            }
            else {
                if (maxDurationOfNextBook == 0) {
                    status = BookingStatus.quotaExceeded;
                }
                else if (cooldownRemainingMins > 0) {
                    status = BookingStatus.cooldownRemaining;
                }
                else {
                    status = BookingStatus.needsToBook;
                }
            }

            let ret: MakeABookingResponse = {
                userId: user.id,
                todaysQuota: todaysQuota,
                totalQuotaTime: totalQuotaTime,
                quotasIncludingRollovers: includingRollovers,
                pastBookings: pastBookings,
                inProgressBookings: inProgressBookings,
                pastBookingsTotalTimeMins: pastBookingsTotalTimeMins,
                inProgressBookingsTotalTimeMins: inProgressBookingsTotalTimeMins,
                cooldownRemainingMins: cooldownRemainingMins,
                maxDurationOfNextBook: maxDurationOfNextBook,
                timeRemainingOnCurrentBooking: timeRemainingOnCurrentBooking,
                status: status,
                error: "", 
            }

            res.status(200).json(ret);
        });
    }
}