# plens.barcelona

**plens.barcelona** és una plataforma cívica que transforma les sessions plenàries del Consell Municipal de Barcelona en dades obertes, estructurades i reutilitzables.

L'objectiu és contribuir a una democràcia local més transparent i una ciutadania més informada, oferint eines que permetin explorar què es debat, qui ho diu i com es posicionen els grups municipals sobre els temes que afecten la ciutat.

## 🏛️ El projecte
El projecte neix de la convicció que la informació pública ha de ser accessible, contrastable i comprensible per a tothom. Convertim informació pública dispersa (vídeos de llarga durada, actes en PDF, ordres del dia tècniques) en un conjunt de dades obert i navegable:

- **Intervencions indexades** per orador, partit i temàtica.
- **Resums automàtics** de cada punt de l'ordre del dia.
- **Mètriques de polarització** i detecció de discurs.
- **Cercador de text complet** sobre tot el que s'ha dit al ple.

## ⚙️ Com funciona
El procés combina fonts públiques amb eines d'intel·ligència artificial de codi obert:

1.  **Fonts públiques**: Recopilació automatitzada de vídeos (YouTube) i documents oficials de l'Ajuntament de Barcelona.
2.  **Transcripció automàtica**: Ús de `WhisperX` per generar text fidel amb marcadors temporals.
3.  **Estructuració amb IA**: Un model de llenguatge (LLM) mapeja intervencions, identifica oradors i genera resums.
4.  **Anàlisi retòrica**: Annotació de categories de discurs (propostes, dades, ideologia, atacs).
5.  **Publicació oberta**: Dades en format JSON i web estàtica sense servidor ni rastrejadors.

## 📊 Mètriques de Polarització
Cada punt de l'ordre del dia s'analitza segons el nivell de confrontació política:
- 🟢 **1: Unanimitat** — Tots els partits d'acord.
- 🟡 **2: Acord majoritari** — Acord amb matisos.
- 🟠 **3: Desacord** — Diferències significatives.
- 🔴 **4: Polarització màxima** — Desacord total.

## 🛠️ Tecnologia
- **Frontend**: [Astro](https://astro.build) (Web estàtica)
- **Cercador**: [Pagefind](https://pagefind.app)
- **Transcripció**: WhisperX
- **Processament**: Python i LLMs per a l'estructuració de dades.

## 📄 Llicència i Esperit
**plens.barcelona** és un projecte cívic independent i no lucratiu. Totes les dades generades es publiquen en obert perquè qualsevol persona, entitat o projecte les pugui reutilitzar.

---
*Projecte desenvolupat per a la millora de la transparència democràtica a Barcelona.*
