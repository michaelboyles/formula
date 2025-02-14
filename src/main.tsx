import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Test1 } from "./test1";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Test1 />
    </StrictMode>
)
