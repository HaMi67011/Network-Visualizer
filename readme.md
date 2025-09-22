# Traceroute Movie

Traceroute Movie is a **dynamic network visualization tool** built with **React, Vite, FastAPI, and Anime.js**.  
It visualizes traceroute hops as an **animated “movie”**, showing packets traveling through nodes and edges in real-time. The final network can be explored in a **force-directed layout**.

---

## **Features**

- Animated traceroute visualization
- Node colors based on hop success:
  - **Green:** successful hop
  - **Red:** packet drop
- Smooth packet animation along edges
- Dynamic layout with viewport shifting
- Final network view with randomized positions
- User input for any IP or domain

---

## **Tech Stack**

- **Frontend:** React, Vite, React Flow, Anime.js  
- **Backend:** Python, FastAPI, Uvicorn  
- **Visualization:** React Flow for nodes & edges, Anime.js for animations  
- **Communication:** SSE (Server-Sent Events) for real-time traceroute data

---

## **Installation & Run**

### 1. Clone or download repository

```bash
git clone https://github.com/HaMi67011/Network-Visualizer
cd 


