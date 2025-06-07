class Filter{
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filter(){
        const queryObject = {...this.queryString};

        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach(el => delete queryObject[el]);

        let queryString = JSON.stringify(queryObject);

        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryString));
        
        return this;
    }
    sort(){
        let sortBy = this.queryString["sort"];
        if(sortBy){
            sortBy = sortBy.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        }
        else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields(){

        let SelectedFields = this.queryString["fields"];

        if(this.queryString["fields"]){
            SelectedFields = SelectedFields.split(",").join(" ");
            this.query = this.query.Select(SelectedFields);
        }
        
        else{
            this.query = this.query.select("-__v");
        }
       
        return this;
    }
    paginate(){

        let page = (parseInt(this.queryString["page"]) ?? 1) * 1 || 1;
        const limit = (parseInt(this.queryString["limit"]) ?? 1) * 1 || 50;
        let skip = (page - 1) * limit || 0;
        this.query = this.query.skip(skip).limit(limit);
        return this;

    }


}
module.exports = Filter;