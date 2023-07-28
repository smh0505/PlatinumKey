interface Dice {
    name: string // for labeling reason
    type: '1d4' | '2d4' | '1d6' | '1d8' | '1d10',
    faces: string[] | number[],
    theme: 'normal' | 'primary' | 'secondary' | 'finally'
}

export const dices: Dice[] = [
    {
        name: "일반 주사위",
        type: '2d4',
        faces: [0, 1, 2, 3],
        theme: 'normal'
    },
    {
        name: "저속 주사위",
        type: '1d10',
        faces: [0, 0, 1, 1, 2, 0, 0, 1, 1, 2],
        theme: 'normal'
    },
    {
        name: "후진 주사위",
        type: '1d10',
        faces: [-4, -3, -2, -1, 1, -4, -3, -2, -1, 1],
        theme: 'secondary'
    },
    {
        name: "황금열쇠 주사위",
        type: '1d8',
        faces: ['다음 열쇠', '이전 열쇠', '다음 열쇠', '이전 열쇠', '다음 열쇠', '이전 열쇠', '다음 열쇠', '이전 열쇠'],
        theme: "normal"
    },
    {
        name: "조커 주사위",
        type: '1d10',
        faces: [4, 4, 0, -4, -4, 4, 4, 0, -4, -4],
        theme: 'finally'
    },
    {
        name: "모서리 주사위",
        type: '1d6',
        faces: ['왼쪽 아래', '왼쪽 위', '오른쪽 위', '왼쪽 아래', '왼쪽 위', '오른쪽 위'],
        theme: 'secondary'
    },
    {
        name: "고속 주사위",
        type: '1d10',
        faces: [4, 4, 3, 3, 2, 4, 4, 3, 3, 2],
        theme: 'primary'
    },
    {
        name: "전진 주사위",
        type: '1d4',
        faces: [1, 2, 3, 4],
        theme: 'primary'
    },
    {
        name: "막고라 주사위",
        type: '1d8',
        faces: ['DJMAX', 'EZ2ON', 'SIXTAR', 'ARCAEA', 'DJMAX', 'EZ2ON', 'SIXTAR', 'ARCAEA'],
        theme: 'primary'
    }
]
