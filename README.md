# AI Task Manager
**Documentație Proiect Cloud Computing**

**Student:** Gheorghe Andrei-Alexandru  
**Grupa:** 1146  
**Program Master:** SIMPRE  

- **Link publicare:** https://ai-task-manager-beta-eight.vercel.app  
- **Link repository GitHub:** https://github.com/AndreiTheG/ai-task-manager  
- **Link video:** https://youtu.be/kWLfqGbgCR0  

---

## 1. Introducere

AI Task Manager este o aplicație web de gestionare a taskurilor care integrează mai multe servicii cloud pentru autentificare, inteligență artificială și notificări prin email. Aplicația permite utilizatorilor să își organizeze taskurile zilnice, să primească sugestii generate automat pentru rezolvarea acestora și să fie notificați prin email la finalizarea unui task.

Scopul aplicației este de a demonstra utilizarea practică a serviciilor cloud moderne într-un scenariu real, combinând funcționalități de tip backend, autentificare și integrare AI într-o singură platformă.

---

## 2. Descriere problemă

Gestionarea taskurilor zilnice poate deveni dificilă atunci când utilizatorii trebuie să urmărească mai multe activități simultan.

În multe situații, aplicațiile clasice de tip To-Do nu oferă:
- asistență inteligentă pentru rezolvarea taskurilor
- notificări automate
- integrare cu servicii cloud moderne
- autentificare securizată și persistarea datelor

AI Task Manager rezolvă această problemă prin:
- organizarea taskurilor într-o interfață simplă
- generarea sugestiilor folosind inteligență artificială
- notificări automate prin email
- autentificare GitHub OAuth
- stocarea datelor în cloud

---

## 3. Descrierea tehnologiilor folosite

**Next.js** — Framework principal folosit atât pentru frontend cât și pentru backend. Permite crearea de pagini React și API routes în același proiect.

**MongoDB Atlas** — Bază de date NoSQL găzduită în cloud, folosită pentru stocarea taskurilor și a utilizatorilor înregistrați cu email și parolă.

**NextAuth.js** — Bibliotecă de autentificare pentru Next.js care gestionează sesiunile utilizatorilor și integrarea cu GitHub OAuth.

**Groq** — Serviciu cloud de inteligență artificială folosit pentru generarea de sugestii practice pentru rezolvarea taskurilor. Rulează modelul LLaMA 3.3.

**SendGrid** — Serviciu cloud de trimitere emailuri. Trimite automat o notificare utilizatorului când un task este marcat ca finalizat.

**GitHub OAuth** — Serviciu cloud de autentificare care permite utilizatorilor să se logheze cu contul lor de GitHub.

**Tailwind CSS** — Framework CSS folosit pentru stilizarea interfeței utilizator.

**Vercel** — Platformă cloud folosită pentru publicarea și găzduirea aplicației.

### Servicii cloud utilizate:

| Serviciu | Rol | Modalitate de integrare |
|---|---|---|
| Groq | Inteligență artificială — generarea sugestiilor | Apeluri API REST |
| SendGrid | Trimitere emailuri automate | API pentru trimiterea emailurilor |
| MongoDB Atlas | Stocarea datelor (utilizatori și taskuri) | Conexiune prin URI MongoDB |
| GitHub | Autentificare utilizatori | Protocol OAuth 2.0 prin NextAuth.js |
| Vercel | Hosting și deployment aplicație | Deploy automat (CI/CD) din GitHub |

---

## 4. Descriere API

### Rute disponibile:

| Metodă | Rută | Descriere | Autentificare |
|---|---|---|---|
| GET | /api/tasks | Obține taskurile utilizatorului autentificat | Necesară |
| POST | /api/tasks | Adaugă un task nou | Necesară |
| GET | /api/tasks/[id] | Obține un task după ID | Nu |
| PUT | /api/tasks/[id] | Actualizează un task existent | Nu |
| DELETE | /api/tasks/[id] | Șterge un task | Nu |
| POST | /api/ai | Generează sugestie AI prin Groq | Nu |
| POST | /api/sendgrid | Trimite email de notificare | Nu |
| POST | /api/register | Creare cont cu email și parolă | Nu |
| GET/POST | /api/auth/[...nextauth] | Gestionare autentificare NextAuth | Nu |

---

## 5. Publicul țintă

**Studenți** — organizarea temelor, proiectelor și examenelor cu ajutorul sugestiilor AI.

**Profesioniști** — gestionarea taskurilor de la muncă cu notificări automate la finalizare.

**Freelanceri** — urmărirea proiectelor pentru clienți diferiți, fiecare utilizator având datele private.

**Uz personal** — liste de obiective și planuri zilnice cu asistență AI.

---

## 6. Workflow-ul aplicației

1. Utilizatorul accesează aplicația și este redirecționat către pagina de autentificare
2. Se autentifică folosind GitHub (OAuth) sau email și parolă
3. După autentificare este redirecționat către Dashboard
4. În dashboard poate adăuga taskuri cu titlu și descriere
5. Pentru fiecare task poate solicita o sugestie generată printr-un apel API către Groq
6. La marcarea unui task ca finalizat, aplicația trimite automat un email folosind SendGrid
7. Taskurile pot fi șterse sau reactivate
8. Sesiunea utilizatorului persistă la refresh, fiind gestionată de NextAuth.js prin mecanisme bazate pe token-uri și cookies

### Autentificare și autorizare:
- **GitHub OAuth 2.0** — autentificare externă prin NextAuth.js
- **Credentials Provider** — email și parolă hash-uite cu bcryptjs
- **JWT Token + Cookie** — sesiunea persistă la refresh
- **getServerSession()** — verificare autentificare în API routes

Fiecare utilizator are acces doar la propriile taskuri.

---

## 7. Exemple de request/response

**POST /api/tasks — Adăugare task:**
```json
// Request
{
  "userId": "andrei@gmail.com",
  "title": "Finalizare proiect Cloud",
  "description": "Trebuie sa termin aplicatia",
  "completed": false,
  "aiSuggestion": "",
  "createdAt": "2026-05-03T10:00:00.000Z"
}
// Response 201
{
  "_id": "661f1a2b3c4d5e6f7a8b9c0d",
  "userId": "andrei@gmail.com",
  "title": "Finalizare proiect Cloud",
  "completed": false
}
// Response 401
{ "error": "Unauthorized" }
```

**POST /api/ai — Sugestie AI:**
```json
// Request
{
  "title": "Finalizare proiect Cloud",
  "description": "Trebuie sa termin aplicatia"
}
// Response 200
{
  "suggestion": "Împarte proiectul în pași mici și începe cu autentificarea."
}
// Response 500
{ "error": "Eroare la generarea sugestiei!" }
```

**POST /api/sendgrid — Trimitere email:**
```json
// Request
{
  "title": "Finalizare proiect Cloud",
  "description": "Trebuie sa termin aplicatia",
  "userEmail": "andrei@gmail.com"
}
// Response 200
{ "success": true }
// Response 500
{ "error": "Eroare la trimiterea emailului!" }
```

**POST /api/register — Creare cont:**
```json
// Request
{
  "name": "Andrei Gheorghe",
  "email": "andrei@gmail.com",
  "password": "parola123"
}
// Response 201
{ "message": "Cont creat cu succes!" }
// Response 400
{ "error": "Toate câmpurile sunt obligatorii!" }
// Response 409
{ "error": "Email-ul este deja folosit!" }
```

---

## 8. Link-uri

- **Aplicație live:** https://ai-task-manager-beta-eight.vercel.app
- **Cod sursă GitHub:** https://github.com/AndreiTheG/ai-task-manager
- **Video workflow:** https://youtu.be/kWLfqGbgCR0

**Servicii cloud folosite:**
- **Groq:** https://console.groq.com
- **SendGrid:** https://sendgrid.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Vercel:** https://vercel.com
- **GitHub OAuth:** https://github.com

---

## 9. Concluzii

Aplicația dezvoltată demonstrează integrarea eficientă a mai multor servicii cloud într-un sistem funcțional. Utilizarea componentelor precum inteligența artificială, autentificarea externă și serviciile de email contribuie la automatizarea proceselor și la îmbunătățirea experienței utilizatorului.

Proiectul evidențiază modul în care tehnologiile moderne pot fi combinate pentru a construi aplicații scalabile și ușor de utilizat.
