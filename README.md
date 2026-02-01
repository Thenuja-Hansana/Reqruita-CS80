<!-- ====== HERO ====== -->
<h1 align="center">Reqruita Desktop 🧠💼</h1>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=2500&pause=700&center=true&vCenter=true&width=700&lines=Secure+Interview+Platform+%E2%80%A2+Anti-Cheat+Focused;Electron+%2B+React+Desktop+App;Fullscreen+Enforcement+%E2%80%A2+Mandatory+Screen+Share" />
</p>

<p align="center">
  <b>Distraction-free technical interviews</b> built as a dedicated desktop experience.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Desktop-111?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Focus-Anti%20Cheat-ff4757?style=for-the-badge" />
</p>

<!-- ====== BADGES ====== -->
<p align="center">
  <img src="https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/WebRTC-333?style=for-the-badge&logo=webrtc&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-screens">Screens</a> •
  <a href="#-run-locally">Run</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---



## ⚡ What’s inside

<table>
<tr>
<td width="33%">

### 🧑‍💼 Admin

<p>
Owns the system.<br/>
Manages access, roles, and interview structure.<br/>
Sets the rules before interviews ever start.
</p>

</td>
<td width="33%">

### 🎙️ Interviewer

<p>
Runs the interview.<br/>
Screen-first view with supporting context.<br/>
Notes, chat, and participants — without clutter.
</p>

</td>
<td width="33%">

### 👨‍💻 Interviewee

<p>
Joins a locked environment.<br/>
Fullscreen enforced.<br/>
Screen sharing required from entry to exit.
</p>

</td>
</tr>
</table>

---

<div align="center">

### 🔒 Entry gate
Microphone · Camera · Screen Share  
Validated before joining. No bypasses.

</div>

---

<div align="center">

### 🛡️ Anti-cheat approach
Not surveillance.<br/>
Structure first. Enforcement later.

</div>


---

## 🎬 Screens


<p align="center">
  <img src="screenshots/role-selection.png" width="50%" alt="Role Selection Screen"/>
</p>

<p align="center">
  <img src="screenshots/meeting-interface.png" width="50%" alt="Meeting Interface"/>
</p>

<details>
  <summary><b>📸 More screenshots</b> (click)</summary>

  <br/>
  <p align="center">
    <img src="screenshots/interviewer-view.png" width="50%" alt="Interviewer UI"/>
  </p>

  <p align="center">
    <img src="screenshots/interviewee-view.png" width="50%" alt="Interviewee UI"/>
  </p>

  <p align="center">
    <img src="screenshots/device-check.png" width="50%" alt="Device Check Screen"/>
  </p>
</details>

---

## 🧱 Tech

- **Electron** (desktop shell)
- **React + Vite** (UI)
- **WebRTC APIs** (`getUserMedia`, `getDisplayMedia`)
- **IPC Bridge** (preload → renderer)
- **Custom CSS** (design-system style)

---

## 🗂️ Structure

```bash
reqruita-desktop/
├─ electron/        
├─ src/            
├─ public/
└─ assets/          
