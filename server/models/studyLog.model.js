import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const studyLogSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    dsaHours:{
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    projectHours:{
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    totalHours:{
        type: Number,
        default: 0,
    },
    problemsSolved:{
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    topics:[{
        type: String,
        trim: true
    }],
    notes:{
        type: String,
        trim: true
    },
    isCompleted:{
        type: Boolean,
        default: false
    }
},{timestamps:true});

studyLogSchema.index({userId:1,date:1},{unique:true});
studyLogSchema.plugin(mongooseAggregatePaginate);

studyLogSchema.pre("save", function(next) {
    this.date = new Date(this.date.setHours(0, 0, 0, 0));
    this.totalHours = this.dsaHours + this.projectHours;
    next();
});

export const StudyLog = mongoose.model("StudyLog",studyLogSchema);