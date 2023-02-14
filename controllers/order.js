import Order from "../Model/order.js";
import moment from "moment";
import { createError } from "../utils/createError.js";

function validate(date){
    // let dateformat = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])[\/]\d{4}$/;
    let dateformat = /^(0?[1-9]|[1-2][0-9]|3[01])[\/](0?[1-9]|1[0-2])[\/]\d{4}$/;
    // Matching the date through regular expression
    if (date.match(dateformat)) {
        let operator = date.split('/');

        // Extract the string into month, date and year
        let datepart = [];
        if (operator.length > 1) {
            datepart = date.split('/');
        }
        let month = parseInt(datepart[1]);
        let day = parseInt(datepart[0]);
        let year = parseInt(datepart[2]);

        // Create a list of days of a month
        let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month == 1 || month > 2) {
            if (day > ListofDays[month - 1]) {
                //to check if the date is out of range
                return false;
            }
        } else if (month == 2) {
            let leapYear = false;
            if ((!(year % 4) && year % 100) || !(year % 400)) leapYear = true;
            if ((leapYear == false) && (day >= 29)) return false;
            else
            if ((leapYear == true) && (day > 29)) {
                console.log('Invalid date format!');
                return false;
            }
        }
    } else {
        console.log("Invalid date format!");
        return false;
    }
    return true;
}



export const createOrder = async (req, res, next) => {
    try {
        const orderData = new Order({ ...req.body });
        const orderList = await Order
            .find({
                hotelName: req.body.hotelName,
                room: req.body.room,
            })
            .where('state').ne('Decline')
            .where('endDate').gt(Date.now())

            console.log(orderList);
        if (!orderList.length) {
            await orderData.save();
            return res.status(200).json(orderData);
        }
        else {
            next(createError(405, "This room has been ordered!"));
        }
    } catch (err) {
        next(err);
    }
}

export const getOrder = async (req, res, next) => {
    try {
        const orderData = await Order.findById(req.params.orderId);

        if (!orderData) {
            return res.status(404).json("Order not found!");
        }
        else {
            return res.status(200).json(orderData);
        }
    } catch (err) {
        next(err);
    }
}

export const getUserOrders = async (req, res, next) => {
    try {
        const orderList = await Order.find({ personalId: req.params.id });

        if (!orderList.length) {
            return res.status(405).json("This user order is empty!");
        }
        else {
            return res.status(200).json(orderList);
        }
    } catch (err) {
        next(err);
    }
}

export const getAllOrders = async (req, res, next) => {
    try {
        const orderList = await Order.find();
        res.status(200).json(orderList);
    } catch (err) {
        next(err);
    }
}

export const updateOrder = async (req, res, next) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        next(createError(404, "Can not update!"));
    }
}

export const deleteOrder = async (req, res, next) => {
    try {
        await Order.findByIdAndDelete(req.params.orderId);
        res.status(200).json("Order has been deleted.");
    } catch (err) {
        next(err);
    }
}