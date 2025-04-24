using System;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using gateway;

public class Program
{
    public static async Task Main()
    {


        // var received = await Receive(lanSocket);
        // Console.WriteLine(received);
        // await s.SendToAsync(, endpoint);
        var e = new SocketAsyncEventArgs();
        var s = new UDPSocket("192.168.0.39", e, (b) => {
            byte[] srcAddress = b.GetSourceAddress().ToArray();
            byte[] destAddress = b.GetDestAddress().ToArray();
            Console.WriteLine("src " + BitConverter.ToString(srcAddress));
            Console.WriteLine("dest " + BitConverter.ToString(destAddress));
            Console.WriteLine("len " + e.BytesTransferred + 14);
            b.SetSourceAddress(destAddress);
            b.SetDestAddress(srcAddress);
            b.SetId(7777);
            b.FixIPChecksum();
            b.FixUDPChecksum();
        });
        s.Listen();

        var task = new TaskCompletionSource();
        await task.Task;

        // while(true) {
        //     await s.Receive();
        //     if (!e.MemoryBuffer.IsUDP()) {
        //         Console.WriteLine("not udp");
        //         break;
        //     }
        //     Console.WriteLine(BitConverter.ToString(e.MemoryBuffer.ToArray()));
        //     e.MemoryBuffer.SetSourceAddress(new Span<byte>(new byte[] { 192, 168, 0, 39 }));
        //     e.MemoryBuffer.SetDestAddress(new Span<byte>(new byte[] { 192, 168, 0, 1 }));
        //     e.MemoryBuffer.FixIPChecksum();
        //     Console.WriteLine(BitConverter.ToString(e.MemoryBuffer.ToArray()));
        //     await s.Send();
        // }

        //FromString("45-00-00-27-53-CA-40-00-40-11-64-FF-C0-A8-00-85-C0-A8-00-27-E5-04-13-88-00-13-F3-6F-68-65-6C-6C-6F-20-77-6F-72-6C-64") );
    }

    public static byte[] FromString(string s)
    {
        String[] arr = s.Split('-');
        byte[] array = new byte[arr.Length];
        for (int i = 0; i < arr.Length; i++) array[i] = Convert.ToByte(arr[i], 16);
        return array;
    }
}
