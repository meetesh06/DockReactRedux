
This project contains two mini projects.

  

1) Main api server - root directory

2) Frontend server - react app, using a development server with proxy

  

NEED TWO TERMINAL TABS

1) **npm start**

2) **cd dock_frontend && npm start**

  

**Development server on port 3000

http://localhost:3000

Api server will be live at

http://localhost:7190**

  

*NOTE:

To prevent cross origin requests I have set up a proxy server in React App... you can find it in dock_frontend/package.json*

  

**REVISION 1.0**

*Create Event lifecycle* complete with the following features

1) Improved design for both mobile and web

2) The Create event page makes use of states and session-storage hybrid approach to save state across one user session, switching between pages preserves the form data for create event.

3) The data is sent as a post request, simplified and lightweight for the server

**NOTES FOR REVISION 1.0**

to start the project 
1) In the home directory - *npm start*
this will start the api server
2) navigate to dock_frontend folder - *npm start*
this will start the development server, which currently has the react app

you will find the website on http://localhost:3000
you will find the api server on http://localhost:7190

The create event API requests are handled by the following files 

{hostname}/events/api/...
folder /api/events/index.js - handles all the requests for events

{hostname}/api/...
folder /api/index.js - handles all the requests for general purpose interaction, login, logout, etc

**TODO**: 
 - Handle the formdata and store in database
 - Handle file storage
 - Handle sending update to the mobile devices
