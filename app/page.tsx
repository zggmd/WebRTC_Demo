'use client';
import {Peer} from 'peerjs'
import Image from 'next/image'
import {useCallback, useEffect, useState} from "react";
import * as fs from "fs";

const mySelf = 'mySelf'
const others = 'others'

export default function Home() {
  const [id, setId] = useState<string>('')
  const [otherId, setOtherId] = useState<string>('')
  const [peer, setPeer] = useState<Peer>()
  const [connect, setConnect] = useState<any>()
  const [messages, setMessages] = useState<any[]>([]);
  const [sendMsg, setSendMsg] = useState<string>()
  const startPeer = useCallback(() => {
    if (!id) return
    const _peer = new Peer(id);
    _peer.on('open', () => {
      console.log(`peer open: id=${_peer.id}`)
    })
    setPeer(_peer)
  }, [id, setPeer])

  useEffect(() => {
    if (!peer) return
    peer.on('connection', (conn) => {
      console.log('connection')
      conn.on('data', (data) => {
        console.log('conn.on: data', data)
        setMessages(prevState => [...prevState, {from: others, msg: data}])
      })
    })
  }, [peer, setMessages])

  const startConnect = useCallback(() => {
    if (!peer ||!otherId) return
    const conn = peer.connect(otherId)
    conn.on('open', () => {
      console.log(`连接到 ${otherId}`)
      conn.send(`hello, I'm ${peer.id}`)
    })
    setConnect(conn)
  }, [peer, otherId, setConnect])
  const send = useCallback(() => {
    if (!connect || !sendMsg) return
    connect.send(sendMsg)
    setMessages(prevState => [...prevState, {from: mySelf, msg: sendMsg}])
    setSendMsg('')
  }, [connect, sendMsg, setMessages, setSendMsg])
  return (
    <main className="">
      <br/>
      我的id:<input value={id} onChange={(e) => setId(e.target.value)} placeholder={'Peer ID'}/>
      <button onClick={startPeer}>开启服务</button>
      <br/>
      连接id: <input value={otherId} onChange={(e) => setOtherId(e.target.value)} placeholder={'other Peer ID'}/>
      <button onClick={startConnect}>连接</button>
      <br/> <br/>
      消息列表:
      <div className="" style={{
        background: "rgb(244 243 244)",
        display: "flex",
        flexDirection: "column",
      }}>
        {messages.map((msg, index) => (
          msg.from === mySelf? (
            <p
              style={{
                alignSelf: "flex-end",
              }}
              key={index}>{msg.msg}: {id}</p>
        ) : (
            <p
              style={{
                alignSelf: "flex-start",
              }}
              key={index}>{otherId}: {msg.msg}</p>
          )))}
      </div>
      <br/> <br/>
      <textarea value={sendMsg} onChange={(e) => setSendMsg(e.target.value)} placeholder="发送消息"/>
      <button onClick={send}>发送</button>
    </main>
  )
}
