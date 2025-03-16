
export function checkEnv() {
    if (process.env.DEFAULT_THIS_HOST == undefined) {
        throw("env not found");
    }
}