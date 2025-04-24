
namespace gateway;

public static class MemoryByteExtensions
{
    public static byte[] BytesFromHexString(string s)
    {
        String[] arr = s.Chunk(2).Select(arr => new string(arr)).ToArray();
        byte[] array = new byte[arr.Length];
        for (int i = 0; i < arr.Length; i++) array[i] = Convert.ToByte(arr[i], 16);
        return array;
    }

    public static bool IsIpv4(this byte[] bytes) => (bytes[0] >> 4) == 4;

    public static bool IsUDP(this byte[] bytes) => bytes[9] == 17;

    public static ushort GetId(this byte[] bytes) => (ushort)(bytes[4] << 8 | bytes[5]);

    public static void SetId(this byte[] bytes, ushort id)
    {
        bytes[4] = (byte)(id >> 8);
        bytes[5] = (byte)id;
    }

    public static byte[] GetSourceAddress(this byte[] bytes) => bytes[12..16];

    public static byte[] GetDestAddress(this byte[] bytes) => bytes[16..20];

    public static void SetSourceAddress(this byte[] bytes, byte[] newSourceAddress) => newSourceAddress.CopyTo(bytes, 12);

    public static void SetDestAddress(this byte[] bytes, byte[] newSourceAddress) => newSourceAddress.CopyTo(bytes, 16);

    public static bool PassesIPChecksum(this byte[] bytes)
    {
        int ret = 0;
        for (var i = 0; i < 20; i += 2)
        {
            ret += bytes[i] << 8 | bytes[i + 1];
        }
        var carry = ret >> 16;
        ret += carry;
        return (ret & 0xffff) == 0xffff;
    }

    public static void FixIPChecksum(this byte[] bytes)
    {
        int ret = 0;
        for (var i = 0; i < 20; i += 2)
        {
            if (i != 10)
            {
                ret += bytes[i] << 8 | bytes[i + 1];
            }
        }
        var carry = ret >> 16;
        ret += carry;
        ret = ~ret;
        bytes[10] = (byte)(ret >> 8);
        bytes[11] = (byte)ret;
    }

    public static bool PassesUDPChecksum(this byte[] bytes)
    {
        //pseudo header
        int[] bit16indexes = new int[] {
            12, 14, //source address
            16, 18, //dest address
            24, //UDP length
        };
        int ret = 0;
        foreach (var i in bit16indexes)
        {
            ret += bytes[i] << 8 | bytes[i + 1];
        }
        ret += bytes[9]; //protocol

        //entire udp datagram
        var UDPlength = bytes[24] << 8 | bytes[25];
        var payloadLastIndex = UDPlength + 19; //58 + 27 = index 85
        for (var k = 20; k < payloadLastIndex; k += 2)
        {
            ret += bytes[k] << 8 | bytes[k + 1];
        }
        if (UDPlength % 2 == 1) {
            ret += bytes[payloadLastIndex] << 8;
        }
        var carry = ret >> 16;
        ret += carry;
        return (ret & 0xffff) == 0xffff;
    }

    public static void FixUDPChecksum(this byte[] bytes)
    {
        //pseudo header
        int[] bit16indexes = new int[] {
            12, 14, //source address
            16, 18, //dest address
            24, //UDP length
        };
        int ret = 0;
        foreach (var i in bit16indexes)
        {
            ret += bytes[i] << 8 | bytes[i + 1];
        }
        ret += bytes[9]; //protocol
        
        //entire udp datagram
        var UDPlength = bytes[24] << 8 | bytes[25];
        var payloadLastIndex = UDPlength + 19; //58 + 27 = index 85
        for (var k = 20; k < payloadLastIndex; k += 2)
        {
            ret += bytes[k] << 8 | bytes[k + 1];
        }
        if (UDPlength % 2 == 1) {
            ret += bytes[payloadLastIndex] << 8;
        }

        //subtract current checksum
        ret -= bytes[26] << 8 | bytes[27];

        var carry = ret >> 16;
        ret += carry;
        ret = ~ret;

        bytes[26] = (byte)(ret >> 8);
        bytes[27] = (byte)ret;
    }
}