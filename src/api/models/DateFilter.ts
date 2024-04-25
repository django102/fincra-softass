import moment from "moment";

export default class DateFilter {
    public startDate: string = moment().format("yyyy-MM-dd 00:00:00");
    public endDate: string = moment().format("yyyy-MM-dd 23:59:59");
}