import { createContext, useContext, useState } from 'react';

const UnitContext = createContext(null);

export function UnitProvider({ children }) {
    const [activeUnit, setActiveUnit] = useState(null);

    return (
        <UnitContext.Provider value={{ activeUnit, setActiveUnit }}>
            {children}
        </UnitContext.Provider>
    );
}

export function useUnit() {
    const ctx = useContext(UnitContext);
    if (!ctx) throw new Error('useUnit must be used inside <UnitProvider>');
    return ctx;
}