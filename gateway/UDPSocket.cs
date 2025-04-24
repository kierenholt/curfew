using System.Net;
using System.Net.Sockets;

public class UDPSocket
{
    static int SocketBufferSize = 1400;
    Socket socket;
    SocketAsyncEventArgs e;
    Action<byte[]> _modify;
    byte[] buffer;

    public UDPSocket(string bindAddress, SocketAsyncEventArgs eventArgs, Action<byte[]> modify)
    {
        buffer = new byte[SocketBufferSize]; 
        socket = new Socket(AddressFamily.InterNetwork, SocketType.Raw, ProtocolType.Udp);
        socket.SetSocketOption(SocketOptionLevel.IP, SocketOptionName.HeaderIncluded, 1);
        socket.SetSocketOption(SocketOptionLevel.IP, SocketOptionName.PacketInformation, 1);

        IPEndPoint lanEndpoint = new IPEndPoint(IPAddress.Parse(bindAddress), 0);
        socket.Bind(lanEndpoint);

        IPAddress samsung = new IPAddress([192, 168, 0, 133]); //only applies when sending
        IPEndPoint rcvEndpoint = new IPEndPoint(samsung, 0);
        e = eventArgs;
        e.RemoteEndPoint = rcvEndpoint;
        _modify = modify;
        e.Completed += (s, e) =>
        {
            // determine which type of operation just completed and call the associated handler
            switch (e.LastOperation)
            {
                case SocketAsyncOperation.ReceiveFrom:
                    _modify(buffer);
                    Reply();
                    break;
                case SocketAsyncOperation.SendTo:
                    Listen();
                    break;
                default:
                    throw new ArgumentException("The last operation completed on the socket was not a receive or send");
            }
        };
    }

    public void Listen()
    {
        e.SetBuffer(buffer);
        var pending = socket.ReceiveFromAsync(e);
        if (!pending)
        {
            _modify(buffer);
            Reply();
        }
    }

    public void Reply()
    {
        e.SetBuffer(buffer[0..e.BytesTransferred]);
        var pending = socket.SendToAsync(e);
        if (!pending)
        {
            //Listen();
        }
    }
}