import { useEffect } from "react";

export function useScrollDown(hash) {

    useEffect(() => {
        if (hash) {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
    }, [hash]);
}