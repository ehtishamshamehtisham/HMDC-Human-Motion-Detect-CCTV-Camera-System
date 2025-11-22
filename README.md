STEP 1 — Install required software
(A) Node.js

Required for backend.

👉 Install from: https://nodejs.org

Minimum version: Node 18+

(B) VS Code

(C) Git

To clone/push GitHub repo.

👉 https://git-scm.com/downloads

D) MongoDB Atlas

Cloud database — NO installation on your PC.

You only need Atlas connection string (MONGO_URI).

(E) GitHub Repository

Process:
1:Open VS Code 
Press Ctrl+Shift+P (Windows/Linux) or
Cmd+Shift+P (Mac)
then type Git:clone
and paste:https://github.com/ehtishamshamehtisham/HMDC-Human-Motion-Detect-CCTV-Camera-System
create a folder new.
2:And Open Cloned Repository
3:open terminals(Two)
in first terminal type cd backend
and install:npm install express mongoose cors multer dotenv
npm install jsonwebtoken bcryptjs or simple "npm install"
4:create .env file in backend
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
MONGO_URI = "mongodb+srv://<your-atlas-user>:<your-password>@cluster.mongodb.net/hmdc"
JWT_SECRET = "supersecretjwt"
GRIDFS_BUCKET = "uploads"
PORT = 3000
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
In second Terminal,
cd hmdc-python and install 
pip install flask opencv-python numpy
ALL The Things are installed 
in first terminal typee npm start
and second terminal type python hmdc.py



