const sgst = 6
const cgst = 6

export const calculateSgst = (amount:number) => {
    return amount * sgst /100
}

export const calculateCgst = (amount:number) => {
    return amount * cgst /100
}