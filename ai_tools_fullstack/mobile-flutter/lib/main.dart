import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() => runApp(const MyApp());
class MyApp extends StatelessWidget{ const MyApp({super.key}); @override Widget build(context)=>MaterialApp(home: ChatPage()); }

class ChatPage extends StatefulWidget{ const ChatPage({super.key}); @override State<ChatPage> createState()=>_ChatPageState(); }
class _ChatPageState extends State<ChatPage>{
  final _ctrl = TextEditingController();
  String _reply = '';

  Future<void> send() async{
    final p = _ctrl.text;
    final token = 'DEMO_TOKEN'; // replace with auth
    final res = await http.post(Uri.parse('https://your-backend.example.com/api/ai/chat'),
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: jsonEncode({'prompt':p}));
    setState(()=> _reply = res.body);
  }

  @override Widget build(context)=>Scaffold(
    appBar: AppBar(title: const Text('AI Tools Mobile')),
    body: Padding(padding: const EdgeInsets.all(12), child: Column(children:[
      Expanded(child: SingleChildScrollView(child: Text(_reply))),
      TextField(controller: _ctrl, decoration: const InputDecoration(hintText: 'Enter prompt')),
      ElevatedButton(onPressed: send, child: const Text('Send'))
    ])),
  );
}
