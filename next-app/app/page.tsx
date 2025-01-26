"use client"
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {

  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const [curMessage, setCurMessage] = useState("");
  const [room, setRoom] = useState("");
  const [isRoom, setIsRoom] = useState<boolean>(false);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server with ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    socket.on("room-message", (data: { id: string, text: string }) => {
      setRoomMessages((prevMessages: any) => [...prevMessages, data]);
    })

    socket.on("message", (data: { id: string, text: string }) => {
      setMessages((prevMessages: any) => [...prevMessages, data]);
    })

    return () => {
      socket.disconnect();
    }
  }, [])

  const sendData = () => {
    if (socket && curMessage.trim() !== "") {
      if (room !== '') {
        socket.emit("room-message", { room, curMessage });
      }
      else {
        socket.emit("message", curMessage);
      }
      setCurMessage("");
    } else {
      console.error("Socket is not connected or message is empty.");
    }
  }
  const joinRoom = () => {
    setIsRoom(true);
    socket.emit("join-room", room);
  }
  const leaveRoom = () => {
    setRoom('');
    setIsRoom(false)
    setRoomMessages([])
    socket.emit("leave-room", room);
  }
  return (
    <div className="flex max-md:flex-col-reverse md:justify-around md:gap-8 gap-4 items-center sm:items-start w-full md:p-10 max-md:px-2">
      <div className="md:h-[80vh] max-md:bg-black max-md:fixed max-md:bottom-0 justify-end items-center md:p-10 gap-5 p-3 md:mt-3 flex flex-col">
        {
          isRoom ?
            <div className='flex gap-6 w-full justify-center items-center'>
              <div className='p-2 rounded-xl ring-1 w-fit min-w-40 text-center ring-gray-500 focus-within:ring-2 text-white' >{room}</div>
              <button className='text-black bg-white px-5 py-1 rounded-xl' onClick={leaveRoom}>Leave Room</button>
            </div>
            :
            <div className='flex gap-6 w-full justify-center items-end'>
              <input type="text" className='p-2 bg-gray-800 rounded-xl ring-1 w-64 ring-gray-500 focus-within:ring-2 text-white' placeholder='Join Room' onKeyDown={(e) => e.key === "Enter" && joinRoom()} onChange={(e) => setRoom(e.target.value)} value={room} />
              <button className='text-black bg-white px-5 py-1 rounded-xl' onClick={joinRoom}>Join</button>
            </div>
        }
        <div className='flex gap-6 w-full justify-center items-center'>
          <input type="text" className='p-2 bg-gray-800 rounded-xl ring-1 w-64 ring-gray-500 focus-within:ring-2 text-white' placeholder='Enter the message here' onKeyDown={(e) => e.key === "Enter" && sendData()} onChange={(e) => setCurMessage(e.target.value)} value={curMessage} />
          <button className='text-black bg-white px-5 py-1 rounded-xl' onClick={sendData}>Send</button>
        </div>
      </div>
      <div className="md:w-1/2 w-full md:h-[80vh] h-2/3">
        {
          isRoom ?
            <div>
              <h2 className="text-center text-xl font-bold py-2">
                {`${room} Chat`}
              </h2>
              <div className='flex flex-col gap-2 md:mt-10 w-full md:h-[80vh] h-full overflow-y-auto md:border-2 md:shadow-slate-800 md:shadow-md md:hover:shadow-2xl md:hover:shadow-slate-800 md:border-slate-600 rounded-xl p-10'>
                {
                  roomMessages.map((message: any, index: number) => <div className={`${message.id === socket.id ? "self-start bg-white text-black" : "self-end bg-emerald-600 text-white"} rounded-full px-5 py-2 w-fit h-fit`} key={index}>{message.text}</div>)
                }
              </div>
            </div>
            :
            <div>
              <h2 className="text-center text-xl font-bold py-2">
                General Chat
              </h2>
              <div className='flex flex-col gap-2 md:mt-10 w-full md:h-[80vh] h-full overflow-y-auto md:border-2 md:shadow-slate-800 md:shadow-md md:hover:shadow-2xl md:hover:shadow-slate-800 md:border-slate-600 rounded-xl p-10'>
                {
                  messages.map((message: any, index: number) => <div className={`${message.id === socket.id ? "self-start bg-white text-black" : "self-end bg-emerald-600 text-white"} rounded-full px-5 py-2 w-fit h-fit`} key={index}>{message.text}</div>)
                }
              </div>
            </div>
        }
      </div>
    </div>
  );
}
