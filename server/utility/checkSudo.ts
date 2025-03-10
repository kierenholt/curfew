export function checkSudo() {
    if (!Number(process.env.SUDO_UID)) throw("process must be run as root user");
}