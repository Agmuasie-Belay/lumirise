# 🪶 LumiRise MERN App 

### **A Scalable Learning & Mentorship Management System Built with the MERN Stack**

The **LumiRise MERN App** is a full‑stack learning and
mentorship management platform built using **React (frontend)** and
**Node/Express + MongoDB (backend)**.\
It demonstrates professional software engineering practices, clean
modular architecture, and full workflow automation for student--tutor
interaction.

## Live Application

The app is live at:  
[https://lumirise-sage.vercel.app/](https://lumirise-sage.vercel.app/)

------------------------------------------------------------------------

# 🖥️ Frontend Overview (React + Zustand + Chakra UI)

The **frontend** of LumiRise is built with modern, scalable,
maintainable tools:

## 🚀 Tech Stack

### **React**

-   Component‑driven UI\
-   Optimized rendering\
-   Hooks‑based architecture

### **Zustand**

-   Lightweight and scalable global state management\
-   Store slices for modules, users, enrollments, and UI state\
-   Clean separation of server and UI logic

### **Chakra UI**

-   Accessible and customizable components\
-   Consistent design system\
-   Dark/light theme support

### **Reusable & Scalable Components**

-   Modular UI architecture\
-   Shared styling tokens\
-   Reusable:
    -   Cards\
    -   Tabs\
    -   Modals\
    -   Form components\
    -   Loaders\
    -   Toast handlers\
-   File and folder structure that scales for enterprise apps

### 📦 API Integration Layer

-   A dedicated `api.js` wrapper using Axios\
-   Centralized error handling\
-   Automatic token injection\
-   API and UI fully aligned with backend OpenAPI spec

------------------------------------------------------------------------

# 📄 Backend Summary

### 🔐 **Authentication & Authorization**

-   JWT-based authentication\
-   Secure role-based access (`student`, `tutor`, `admin`)\
-   Email/phone login and flexible signup workflow

### 📘 **Module & Content Management**

-   Tutors can create, update, publish, and delete modules\
-   Admins can approve or reject module updates and deletions\
-   Modules support tasks, MCQs, and student activity tracking

### 🎓 **Student Enrollment & Learning Journey**

-   Students enroll in modules with hourly rate + expected completion
    date\
-   System auto-tracks tasks, MCQs, and progress logic\
-   Tutors update progress and provide feedback

### 📝 **Feedback & Progress Monitoring**

-   Tutors/admins can submit or update feedback\
-   Students can view progress over time

### 🧩 **Clean, Extensible Architecture**

-   Follows MVC structure for scalability\
-   Uses separate layers for controllers, routes, models, validation,
    and services\
-   Fully documented using **OpenAPI 3.1.0**

------------------------------------------------------------------------

# 🔗 Frontend--Backend Sync

The frontend is fully synced with backend behavior via:

-   Zustand stores using async actions\
-   Uses backend responses to render:
    -   Module cards\
    -   Progress indicators\
    -   Enrollment status\
    -   MCQ/task completion\
-   Auto‑generated UI changes based on user roles\
    (student, tutor, admin)\
-   Secure routes guarded by JWT

------------------------------------------------------------------------

# 🎯 Overall features

### ✔ End‑to‑End System Architecture

-   Built both backend and frontend with aligned schemas and workflows.

### ✔ Production‑Ready Frontend

-   Uses scalable global state (Zustand)\
-   Follows atomic/reusable component design\
-   Chakra-based consistent UI/UX\
-   API-driven rendering

### ✔ Modern Backend Engineering

-   Complete OpenAPI documentation\
-   Modular controllers, models, and services\
-   JWT authentication\
-   Clean error handling

### ✔ Portfolio Quality

-   This repo clearly demonstrates my capability to deliver **real-world
full-stack systems**, not toy apps.

## Live Application

The app is live at:  
[https://lumirise-sage.vercel.app/](https://lumirise-sage.vercel.app/)



------------------------------------------------------------------------

# 👤 About the Developer

**Agmuasie Belay** --- Developer, and EdTech
Technologist\
Based in Addis Ababa, Ethiopia.

------------------------------------------------------------------------

# 📩 Contact

📧 **agmuasie.belay71@gmail.com**\
🔗 **LinkedIn:** https://www.linkedin.com/in/agmuasie-belay
