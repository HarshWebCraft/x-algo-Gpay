
const { default: axios } = require('axios');
const User = require('../models/users')
const { WebSocket } = require('ws');

const stra1OrderPlace = async (a) => {

    let date=new Date();
    let ws = new WebSocket('ws://localhost:3001');
    let ceEnd = false;
    let ceEntry = false;
    let entryPrice = 0;
    let ceSL = 0;
    let ceTP = 0;
    let peEnd = false;
    let exitFlag = false;
    let exit = 0;
    let peHigh = a.peHigh
    let ceHigh = a.ceHigh;
    let ceToken=a.ceToken;
    let peToken=a.peToken;
    let peEntry = false;
    let peSL = 0;
    let peTP = 0;
    let time='';
    let exittime='';
    let symbol='';
    let pl=0;

    ws.onmessage = async (event) => {
            
        console.log(event.data)
        const data = JSON.parse(event.data);




        if (!exitFlag) {

            if (!ceEnd && data.token == `"${ceToken}"`) {


                console.log(ceHigh+" and "+peHigh+" and "+data.last_traded_price)
                if (data.last_traded_price / 100 > ceHigh && !ceEntry) {
                    console.log('asdfghjkl')
                    time=date.getHours()+":"+date.getMinutes()
                    symbol=ceToken;
                    entryPrice = data.last_traded_price / 100;
                    ceSL = data.last_traded_price / 100 - 1;
                    ceTP = data.last_traded_price / 100 + 1;
                    peEnd = true;
                    ceEntry = true;
                }
                if (data.last_traded_price / 100 > ceTP && ceEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime=date.getHours()+":"+date.getMinutes()
                    pl=(data.last_traded_price / 100 - entryPrice) * 15;
                    ceEnd = true;
                    exitFlag = true;
                }
                if (data.last_traded_price / 100 < ceSL && ceEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime=date.getHours()+":"+date.getMinutes()
                    pl=(data.last_traded_price / 100 - entryPrice) * 15;
                    exitFlag = true;
                    ceEnd = true;
                }

            }

            if (data.token == `"${peToken}"` && !peEnd) {


                if (data.last_traded_price / 100 > peHigh && !peEntry) {
                    time=date.getHours()+":"+date.getMinutes()
                    symbol=peToken;
                    entryPrice = data.last_traded_price / 100;
                    peSL = data.last_traded_price / 100 - 1;
                    peTP = data.last_traded_price / 100 + 1;
                    ceEnd = true;
                    peEntry = true;
                }
                if (data.last_traded_price / 100 > peTP && peEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime=date.getHours()+":"+date.getMinutes()
                    peEnd = true;
                    pl=(data.last_traded_price / 100 - entryPrice) * 15;
                    exitFlag = true;
                }
                if (data.last_traded_price / 100 < peSL && peEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime=date.getHours()+":"+date.getMinutes()
                    pl=(data.last_traded_price / 100 - entryPrice) * 15;
                    exitFlag = true;
                    peEnd = true;
                }

            }
        }
        else
        {
            const excelData = { no: 1, signalTime:time, symbol: symbol, quantity: 15, entryPrice: entryPrice, exit: exittime, pl: pl };
            const response = await axios.post('http://localhost:5000/add-excel-data', excelData)
        }


    }



}

module.exports = stra1OrderPlace