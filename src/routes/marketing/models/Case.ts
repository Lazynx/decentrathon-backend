// src/constants/cases.ts

export type Outcome = {
    type: 'gold' | 'broken';
    value: number; // количество голды
    message: string;
};

export interface CaseType {
    name: string;
    cost: number;
    outcomes: { chance: number; outcome: Outcome }[];
}

export const Cases: CaseType[] = [
    {
        name: 'Простецкий',
        cost: 300,
        outcomes: [
            {
                chance: 0.7, // 70%
                outcome: { type: 'broken', value: 0, message: 'Неудача! Вы получили плохую карточку (0 голды).' },
            },
            {
                chance: 0.25, // 25%
                outcome: { type: 'gold', value: 50, message: 'Вы получили 50 голды!' },
            },
            {
                chance: 0.05, // 5%
                outcome: { type: 'gold', value: 500, message: 'Поздравляем! Вы получили 500 голды!' },
            },
        ],
    },
    {
        name: 'Среднячок',
        cost: 400,
        outcomes: [
            {
                chance: 0.3, // 30%
                outcome: { type: 'broken', value: 0, message: 'Неудача! Вы получили плохую карточку (0 голды).' },
            },
            {
                chance: 0.5, // 50%
                outcome: { type: 'gold', value: 50, message: 'Вы получили 50 голды!' },
            },
            {
                chance: 0.15, // 15%
                outcome: { type: 'gold', value: 500, message: 'Поздравляем! Вы получили 500 голды!' },
            },
            {
                chance: 0.05, // 5%
                outcome: { type: 'gold', value: 1500, message: 'Вау! Вы получили 1500 голды!' },
            },
        ],
    },
    {
        name: 'Золотой',
        cost: 1000,
        outcomes: [
            {
                chance: 0.6, // 60%
                outcome: { type: 'gold', value: 500, message: 'Вы получили 500 голды!' },
            },
            {
                chance: 0.3, // 30%
                outcome: { type: 'gold', value: 50, message: 'Вы получили 50 голды!' },
            },
            {
                chance: 0.1, // 10%
                outcome: { type: 'gold', value: 1500, message: 'Невероятно! Вы получили 1500 голды!' },
            },
        ],
    },
];
