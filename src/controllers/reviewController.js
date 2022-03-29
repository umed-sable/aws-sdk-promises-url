//const userModel = require("../models/userModel")
const bookModel = require("../models/bookModels")
const reviewModel = require("../models/reviewModel")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// create intern.....................................................................

const createReview = async function (req, res) {
    try {
        const data = req.body;
        const bookId = req.params.bookId

        if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, msg: "Invalid request Please provide details of an user" }) }
        const { reviewedBy, reviewedAt, rating, review } = data;

        if (!(isValid(bookId) && isValidObjectId(bookId))) {
            return res.status(400).send({ status: false, msg: "bookId is not valid" })
        }

        let bookDetail = await bookModel.findById({ _id: bookId, isDeleted: false });
        console.log(bookDetail)
        if (!bookDetail) { return res.status(400).send({ status: false, msg: "book does not exists" }) }

        if (!isValid(reviewedBy)) { return res.status(400).send({ status: false, msg: "reviewedBy is required" }) }

        if (!isValid(reviewedAt)) { return res.status(400).send({ status: false, msg: "reviewedAt is required" }) }

        if (!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(reviewedAt)) {
            return res.status(400).send({ status: false, msg: "Date should be in the format YYYY-MM-DD and it should be in digit" })
        }

        if (!isValid(review)) { return res.status(400).send({ status: false, msg: "please provide valid review" }) }

        if (!isValid(rating)) { return res.status(400).send({ status: false, msg: "rating is not valid " }) }

        if (!/^[1-5]$/.test(rating)) {
            return res.status(400).send({ status: false, msg: "Rating should be between 1-5" })
        }
        const newReviewData = await reviewModel.create(data)

        const reviewData = {
            _id: newReviewData._id,
            bookId: bookId,
            reviewedBy: newReviewData.reviewedBy,
            reviewedAt: newReviewData.reviewedAt,
            rating: newReviewData.rating,
            review: newReviewData.review,
            // releasedAt: newReviewData.releasedAt,
            // isDeleted: isDeleted ? isDeleted : false
        }

        res.status(201).send({ status: true, msg: "Thanks for reviewing this book..!!", data: reviewData })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.createReview = createReview

//update.......................................................

const updateReview = async function (req, res) {
    try {
        let data = req.body
        if (!isValid(data)) return res.status(400).send({ status: false, Message: "Please provide the data..!!" });
        if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, msg: "Invalid review format" }) }

        let bookIdUpdating = req.params.bookId
        let bookIdPresent = await bookModel.findById({ _id: bookIdUpdating, isDeleted: false });

        if (!bookIdPresent) { return res.status(400).send({ status: false, msg: "book does not exists" }) }

        let reviewId = req.params.reviewId

        let reviewIdPresent = await reviewModel.findById({ _id: reviewId, isDeleted: false });

        if (!reviewIdPresent) { return res.status(400).send({ status: false, msg: "review does not exists" }) }

        let updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewername } }, { new: true })
        return res.status(200).send({ Status: true, data: updatedReview })

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message });
    }

}

module.exports.updateReview = updateReview


//delete................................................

const deleteReview = async function (req, res) {
    try {

        let reviewedBookId = req.params.bookId
        if (!isValidObjectId(reviewedBookId)) {
            return res.status(400).send({ status: false, message: "Book id is invalid" })
        }

        const findBookById = await bookModel.findById({ _id: reviewedBookId, isDeleted: false })

        if (!findBookById) {
            return res.status(400).send({ status: false, message: "No Book Available for this Id" })
        }

        let deleteReviewId = req.params.reviewId
        if (!isValidObjectId(deleteReviewId)) {
            return res.status(400).send({ status: false, message: "review id is invalid" })
        }

        const findReview = await reviewModel.findById({ _id: deleteReviewId, isDeleted: false })

        if (!findReview) {
            return res.status(400).send({ status: false, message: "No review Available for this book" })
        }



        const deleteReviewData = await reviewModel.findOneAndUpdate({ _id: { $in: deleteReviewId } },
            { $set: { isDeleted: true } },
            { new: true })//.select({ _id: 1, title: 1, isDeleted: 1, deletedAt: 1 })
        return res.status(200).send({ status: true, message: "review deleted successfullly."})




    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message });
    }


}

module.exports.deleteReview = deleteReview