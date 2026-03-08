# 🔍 API & Request Monitoring Guide

## Project Architecture

### Backend (Socket Server)
**File:** `socket-server.ts` (root directory)
**Port:** 4000
**Protocol:** WebSocket (Socket.IO)

All "endpoints" are socket events handled in this file.

### Frontend
**Files:**
- `app/room/[roomId]/page.tsx` - Main room page
- `components/EditorComponent.tsx` - Code editor component

---

## 🎯 Available Socket Events (Your "API Endpoints")

| Event Name | Direction | Purpose |
|------------|-----------|---------|
| `connection` | Server | New user connects |
| `join-room` | Client → Server | User joins collaboration room |
| `code-change` | Client → Server | User types code |
| `code-update` | Server → Client | Broadcast code changes |
| `language-change` | Client → Server | User changes language |
| `language-update` | Server → Client | Broadcast language change |
| `run-code` | Client → Server | Execute code |
| `code-output` | Server → Client | Send execution result |
| `cursor-move` | Client → Server | Share cursor position |
| `cursor-update` | Server → Client | Broadcast cursor position |
| `disconnect` | Server | User disconnects |

---

## 📊 How to Monitor Requests

### **Method 1: Socket Server Terminal** (Recommended)

1. **Start the socket server:**
   ```bash
   npm run socket
   ```

2. **Watch the console output:**
   - ✅ User connections
   - 📨 All incoming events with data
   - 🚪 Room joins
   - ❌ Disconnections

Example output:
```
✅ User connected: vyeVp5UT3sJHRug4AAAD
📨 [vyeVp5UT3sJHRug4AAAD] Event: "join-room" | Data: ["q6sezdh"]
🚪 User vyeVp5UT3sJHRug4AAAD joined room: q6sezdh
📨 [vyeVp5UT3sJHRug4AAAD] Event: "run-code" | Data: [{"roomId":"q6sezdh","language":"javascript"...
```

### **Method 2: Browser DevTools (Client-Side)**

1. Open your room page (e.g., `http://localhost:3000/room/abc123`)
2. Press `F12` → **Console** tab
3. Type:
   ```javascript
   // Monitor all outgoing events
   window.socketDebug = true;
   
   // View socket status
   socket.connected // true if connected
   ```

### **Method 3: Network Tab (WebSocket Inspection)**

1. Open **DevTools** → **Network** tab
2. Click **WS** filter (WebSocket)
3. Click on the socket connection
4. View **Messages** tab to see all events in real-time

---

## 🛠️ Debugging Tips

### Check if Socket Server is Running:
```bash
# Windows
netstat -an | findstr 4000

# Should show:
# TCP    0.0.0.0:4000    LISTENING
```

### Test Connection from Browser Console:
```javascript
import io from 'socket.io-client';
const testSocket = io('http://localhost:4000');
testSocket.on('connect', () => console.log('✅ Connected!'));
```

### Common Issues:

| Problem | Solution |
|---------|----------|
| No logs appearing | Check if socket server is running on port 4000 |
| "Connection refused" | Start socket server: `npm run socket` |
| Events not firing | Check browser console for errors |
| 401 errors | Add RAPIDAPI_KEY to `.env` file |

---

## 📈 Advanced Monitoring

### Add Custom Logging:
Edit `socket-server.ts` and add logs where needed:
```typescript
socket.on("your-event", (data) => {
  console.log("🔥 Custom event received:", data);
  // Your handler code
});
```

### Performance Monitoring:
```typescript
socket.onAny((event) => {
  const startTime = Date.now();
  socket.once(`${event}-complete`, () => {
    console.log(`⏱️ ${event} took ${Date.now() - startTime}ms`);
  });
});
```

---

## 🆕 Creating Traditional REST API Endpoints

If you need REST endpoints (not WebSockets), create files here:

**Location:** `app/api/[endpoint-name]/route.ts`

**Example:** `app/api/rooms/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello from API' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

**Access:** `http://localhost:3000/api/rooms`

---

## 📝 Current Monitoring Features

✅ Log all connections/disconnections
✅ Log all incoming events with data preview
✅ Log room joins with user IDs
✅ Log code execution attempts
✅ Enhanced console formatting with emojis

**Restart your socket server to see the new logging!**
