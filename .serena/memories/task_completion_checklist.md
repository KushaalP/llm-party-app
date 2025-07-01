# Task Completion Checklist

## After Making Code Changes

### Code Quality
- [ ] Run `npm run lint` to check for linting errors
- [ ] Ensure code follows project conventions (functional components, Tailwind classes)
- [ ] Check that all imports are correctly formatted
- [ ] Verify Socket.io events are properly handled

### Testing
- [ ] Test in development environment (`npm run dev`)
- [ ] Test both frontend and backend functionality
- [ ] Test real-time features (Socket.io events)
- [ ] Test error handling and fallback states
- [ ] Verify mobile responsiveness

### Build & Deploy
- [ ] Run `npm run build` to ensure production build works
- [ ] Check that environment variables are properly configured
- [ ] Test API integrations (Gemini, TMDB) if relevant
- [ ] Verify server startup with `node server.js`

### Git & Documentation
- [ ] `git add` relevant files
- [ ] Write descriptive commit message
- [ ] Update documentation if API changes were made
- [ ] Test that Socket.io connections work properly

## Environment Requirements
- Node.js environment with npm packages installed
- Valid API keys in `.env` file (GEMINI_API_KEY, TMDB_API_KEY)
- Development server running on expected ports