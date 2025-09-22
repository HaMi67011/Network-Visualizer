import React, { useState, useRef, useCallback } from "react";
import ReactFlow, { Background, Controls, ReactFlowProvider, useReactFlow } from "react-flow-renderer";
import anime from "animejs";

function TracerouteDynamicInner({ target, setTarget }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const eventSourceRef = useRef(null);
  const lastXRef = useRef(100);
  const prevNodeIdRef = useRef(null);
  const { setViewport } = useReactFlow();

  const startTraceroute = useCallback(() => {
    setError("");
    setNodes([]);
    setEdges([]);
    setFinished(false);
    lastXRef.current = 100;
    prevNodeIdRef.current = null;

    if (!target.trim()) {
      setError("Enter a valid IP or domain");
      return;
    }

    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = new EventSource(
      `http://127.0.0.1:8000/traceroute?target=${encodeURIComponent(target)}`
    );

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const hopId = `hop-${data.hop}`;

      // Horizontal spacing proportional to RTT
      const rtt = data.avg_time || 20;
      const x = lastXRef.current + rtt * 10;
      const y = 100 + Math.random() * 300;
      lastXRef.current = x;

      // Add node with small delay for “movie effect”
      setTimeout(() => {
        setNodes((nds) => {
          if (!nds.find((n) => n.id === hopId)) {
            const newNode = { id: hopId, data: { label: data.text }, position: { x, y } };

            // Animate existing nodes to avoid overlapping (smooth dynamic layout)
            nds.forEach((n) => {
              anime({
                targets: n.position,
                x: n.position.x + (Math.random() - 0.5) * 20,
                y: n.position.y + (Math.random() - 0.5) * 20,
                duration: 800, // slower shift
                easing: "easeOutQuad",
              });
            });

            // Smooth viewport pan to keep new node visible
            setTimeout(() => {
              setViewport({ x: -x + 300, y: 0, zoom: 1, duration: 1000 }); // slower pan
            }, 100);

            return [...nds, newNode];
          }
          return nds;
        });

        // Add edge
        const prevNodeId = prevNodeIdRef.current;
        if (prevNodeId) {
          const edgeId = `edge-${prevNodeId}-${hopId}`;
          setEdges((eds) => {
            if (!eds.find((e) => e.id === edgeId)) {
              const newEdge = {
                id: edgeId,
                source: prevNodeId,
                target: hopId,
                animated: false,
                style: { stroke: data.avg_time !== null ? "green" : "red", strokeWidth: 2 },
              };
              return [...eds, newEdge];
            }
            return eds;
          });

          // Animate packet along edge (slower)
          setTimeout(() => {
            const path = document.querySelector(`#${edgeId} path`);
            if (path) {
              const length = path.getTotalLength();
              const packet = document.createElement("div");
              packet.style.width = "12px";
              packet.style.height = "12px";
              packet.style.borderRadius = "50%";
              packet.style.backgroundColor = "yellow";
              packet.style.position = "absolute";
              packet.style.zIndex = 9999;
              document.body.appendChild(packet);

              anime({
                targets: packet,
                translateX: path.getPointAtLength(0).x,
                translateY: path.getPointAtLength(0).y,
                duration: rtt * 150 + 1000, // slower packet
                easing: "linear",
                update: (anim) => {
                  const progress = anim.progress / 100;
                  const point = path.getPointAtLength(length * progress);
                  packet.style.transform = `translate(${point.x}px, ${point.y}px)`;
                },
                complete: () => document.body.removeChild(packet),
              });
            }
          }, 200);
        }

        prevNodeIdRef.current = hopId;
      }, 300 * data.hop); // small delay between nodes for movie effect
    };

    es.onerror = () => {
      setError("Traceroute failed or target unreachable");
      es.close();
      setFinished(true);
    };

    eventSourceRef.current = es;
  }, [target, setViewport]);

  return (
    <div className="p-6 bg-slate-800 h-screen">
      <h1 className="text-2xl text-white font-bold mb-4 text-center">Traceroute Movie</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter IP or domain"
          className="flex-1 p-2 rounded bg-slate-700 text-white"
        />
        <button
          onClick={startTraceroute}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
        >
          Start
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <ReactFlow nodes={nodes} edges={edges} fitView style={{ width: "100%", height: "80%" }}>
        <Background />
        <Controls />
      </ReactFlow>

      {finished && (
        <button
          className="mt-4 px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white"
          onClick={() => alert("Final network graph: random layout with all hops")}
        >
          Show Full Network
        </button>
      )}
    </div>
  );
}

export default function TracerouteDynamicWrapper() {
  const [target, setTarget] = useState("");
  return (
    <ReactFlowProvider>
      <TracerouteDynamicInner target={target} setTarget={setTarget} />
    </ReactFlowProvider>
  );
}
