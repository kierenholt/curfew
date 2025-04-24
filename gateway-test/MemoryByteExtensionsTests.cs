namespace test;

using System.Runtime.InteropServices;
using gateway;

public class MemoryByteExtensionsTests
{
    [Fact]
    public void IsIpv4_Ipv6packet_ReturnsFalse()
    {
        byte[] ipv6Bytes = MemoryByteExtensions.BytesFromHexString("600d0600006911fffe800000000000000c57d034341fedc1ff0200000000000000000000000000fb");
        Assert.False(ipv6Bytes.IsIpv4());
    }

    [Fact]
    public void IsIpv4_Ipv4packet_ReturnsTrue()
    {
        byte[] ipv4Bytes = MemoryByteExtensions.BytesFromHexString("4500003e062a4000401171b4c0a8002701010101");
        Assert.True(ipv4Bytes.IsIpv4());
    }

    [Fact]
    public void GetId_IdKnown_ReturnsCorrectId()
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString("4500003e062a4000401171b4c0a8002701010101");
        Assert.Equal((ushort)1578, bytes.GetId());
    }

    [Fact]
    public void GetSourceAddress_AddressKnown_ReturnsCorrectAddress()
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString("4500003e062a4000401171b4c0a8002701010101");
        var expected = new byte[] { 192, 168, 0, 39 };
        Assert.True(CompareSpans(expected, bytes.GetSourceAddress()));
    }

    [Fact]
    public void GetDestAddress_AddressKnown_ReturnsCorrectAddress()
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString("4500003e062a4000401171b4c0a8002701010101");
        var expected = new byte[] { 1, 1, 1, 1 };
        Assert.True(CompareSpans(expected, bytes.GetDestAddress()));
    }

    [Fact]
    public void SetSourceAddress_AddressKnown_SetsCorrectly()
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString("4500003e062a4000401171b4c0a8002701010101");
        byte[] newAddress = new byte[] { 3, 4, 5, 6 };
        bytes.SetSourceAddress(newAddress);
        Assert.True(CompareSpans(newAddress, bytes.GetSourceAddress()));
    }

    [Fact]
    public void SetDestAddress_AddressKnown_SetsCorrectly()
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString("4500003e062a4000401171b4c0a8002701010101");
        byte[] newAddress = new byte[] { 3, 4, 5, 6 };
        bytes.SetDestAddress(newAddress);
        Assert.True(CompareSpans(newAddress, bytes.GetDestAddress()));
    }

    private bool CompareSpans(byte[] a, byte[] b) 
    {
        if (a.Length != b.Length) {
            return false;
        }
        for (var i = 0; i < a.Length; i++) 
        {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    [Theory]
    [InlineData("4500003e062a4000401171b4c0a8002701010101")]
    [InlineData("4500003e2d54400040114a8ac0a8002701010101")]
    [InlineData("4500004e5ac040003811250e01010101c0a80027")]
    public void PassesChecksum_GoodPacket_ReturnsTrue(string s) 
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString(s);
        Assert.True(bytes.PassesIPChecksum());
    }

    [Theory]
    [InlineData("4500003e062a400040110000c0a8002701010107")] //71b4
    [InlineData("4500003e2d54400040110000c0a8002701010109")] //4a8a
    [InlineData("4500004e5ac040003811000001010101c0a8002a")] //250e
    public void FixChecksum_BadPacket_PassesChecksumReturnsTrue(string s) 
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString(s);
        bytes.FixIPChecksum();
        Assert.True(bytes.PassesIPChecksum());
    }

    [Theory]
    [InlineData("450005781e614000381102f907070707070707070035ac290042ef7b132b818000010001000000000377777710676f6f676c657461676d616e6167657203636f6d0000010001c00c000100010000012600048efab3e8")] //excludes payload
    public void PassesUDPChecksum_GoodPacket_ReturnsTrue(string s) 
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString(s);
        Assert.True(bytes.PassesUDPChecksum());
    }

    [Theory]
    [InlineData("450005781e614000381102f907070707070707070035ac2900420000132b818000010001000000000377777710676f6f676c657461676d616e6167657203636f6d0000010001c00c000100010000012600048efab3e8")] //excludes payload
    public void FixUDPChecksum_BadPacket_PassesChecksumReturnsTrue(string s) 
    {
        byte[] bytes = MemoryByteExtensions.BytesFromHexString(s);
        bytes.FixUDPChecksum();
        Assert.True(bytes.PassesUDPChecksum());
    }
}