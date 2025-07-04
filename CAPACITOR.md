# Capacitor Setup for LLM Party App

This app is configured to run on iOS using Capacitor.

## Quick Start

### For iOS Development

1. **First time setup:**
   ```bash
   npm install
   npm run update-ip  # Sets your local IP in .env.local
   ```

2. **Run with backend server:**
   ```bash
   npm run ios:dev
   ```
   This will:
   - Update your local IP address
   - Build the web app
   - Sync to iOS
   - Open Xcode

3. **In Xcode:**
   - Select a simulator or your device
   - Click the play button to run

## Available Scripts

- `npm run ios` - Build and open iOS (server must be running separately)
- `npm run ios:dev` - Build and open iOS (assumes server is already running)
- `npm run ios:dev:full` - Start server AND build/open iOS
- `npm run update-ip` - Update your local IP in .env.local
- `npm run sync:ios` - Just sync changes to iOS
- `npm run open:ios` - Just open Xcode

## Configuration

The app uses environment variables for the server URL:

1. **Development**: Create `.env.local` (automatically done by `npm run update-ip`)
2. **Production**: Set `VITE_SERVER_URL` to your production API URL

## Troubleshooting

### Can't create/join rooms on iOS
- Make sure your backend server is running (`npm run server`)
- Run `npm run update-ip` to update your IP address
- Ensure your device/simulator is on the same network as your dev machine

### "Developer disk image" error on physical device
- Update Xcode to support your iOS version
- Or use the iOS Simulator instead

### Server connection issues
- Check that `VITE_SERVER_URL` in `.env.local` has your correct IP
- Verify server is running on port 3001
- Check firewall settings if on corporate network