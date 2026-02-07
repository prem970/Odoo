/**
 * Quiz Context
 * Logic for tracking active attempt points and progression.
 */
import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
    const [quizState, setQuizState] = useState(null); // Active lesson quiz data
    return (
        <QuizContext.Provider value={{ quizState, setQuizState }}>
            {children}
        </QuizContext.Provider>
    );
};

export const useQuiz = () => useContext(QuizContext);
