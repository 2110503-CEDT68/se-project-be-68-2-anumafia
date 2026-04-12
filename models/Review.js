const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 0 and 5'],
        min: 0,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer'
        }
    },
    reviewText: {
        type: String,
        required: [true, 'Please add review text'],
        maxlength: 500,
        validate: {
            validator: function(value) {
                // Validate that review text is not empty or just whitespace
                return value.trim().length > 0;
            },
            message: 'Review text cannot be empty'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function(value) {
                // Validate that createdAt is not in the future
                return value <= new Date();
            },
            message: 'Created date cannot be in the future'
        }
    }
})

// ฟังก์ชันสำหรับคำนวณค่าเฉลี่ยและจำนวนรีวิว (ใช้ Mongoose Aggregation)
ReviewSchema.statics.getAverageRating = async function(companyId) {
    // ใช้ Aggregation Pipeline เพื่อจัดกลุ่มตาม company และคำนวณ
    const obj = await this.aggregate([
        {
            $match: { company: companyId } // กรองเอาเฉพาะรีวิวของบริษัทนี้
        },
        {
            $group: {
                _id: '$company',
                ratingAverage: { $avg: '$rating' }, // หาค่าเฉลี่ยจากฟิลด์ rating
                reviewCount: { $sum: 1 }            // นับจำนวนรีวิวทั้งหมด
            }
        }
    ]);

    try {
        // นำผลลัพธ์ไปอัปเดตใน Collection Company (หรือแก้เป็น Rating ถ้าคุณแยก Collection)
        if (obj.length > 0) {
            await this.model('Company').findByIdAndUpdate(companyId, {
                // ปัดเศษทศนิยม 1 ตำแหน่ง
                ratingAverage: Math.round(obj[0].ratingAverage * 10) / 10,
                reviewCount: obj[0].reviewCount
            });
        } else {
            // กรณีที่รีวิวถูกลบออกจนหมด
            await this.model('Company').findByIdAndUpdate(companyId, {
                ratingAverage: 0,
                reviewCount: 0
            });
        }
    } catch (err) {
        console.error("Error updating average rating:", err);
    }
};

// Trigger 1: ทำงานทุกครั้งหลังจากมีการสร้างรีวิวใหม่ (Post Save)
ReviewSchema.post('save', function() {
    // this.company คือ companyId ของรีวิวที่เพิ่งถูกบันทึก
    this.constructor.getAverageRating(this.company);
});

// Trigger 2: ทำงานทุกครั้งหลังจากมีการลบรีวิว (Post DeleteOne)
// (สำหรับ Mongoose 7+ ขึ้นไป การลบแบบ document.deleteOne() จะมาเข้า Hook นี้)
ReviewSchema.post('deleteOne', { document: true, query: false }, function() {
    this.constructor.getAverageRating(this.company);
});

module.exports = mongoose.model('Review', ReviewSchema);