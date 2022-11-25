function produce(mapping, source) {

    const fs = require('fs')
    let jsonata = require('jsonata');
    const _ = require('lodash');
    const source_file = require(source);
    
    // source = {
    //     "id": "122-34-6543",
    //     "region": "NA",
    //     "firstName": "Leanne",
    //     "lastName": "Graham",
    //     "address": {
    //         "street": "Kulas Light",
    //         "suite": "Apt. 556",
    //         "city": "Gwenborough",
    //         "zipcode": "92998-3874"
    //     },
    //     "occupation": "selfemployed",
    //     "age": 29,
    //     "loanHistory": [
    //         {
    //             "principal": 40000,
    //             "periodInYears": 3,
    //             "rateOfInterest": 10,
    //             "collateral": [
    //                 {
    //                     "assetName": "property",
    //                     "estimatedValues": 7000
    //                 }
    //             ]
    //         },
    //         {
    //             "principal": 140000,
    //             "periodInYears": 4,
    //             "rateOfInterest": 12,
    //             "isCommercial": true,
    //             "collateral": [
    //                 {
    //                     "assetName": "condo",
    //                     "estimatedValues": 30000
    //                 }
    //             ]
    //         },
    //         {
    //             "principal": 60000,
    //             "periodInYears": 4,
    //             "rateOfInterest": 12
    //         }
    //     ],
    //     "liquid_assets": 100000,
    //     "non_liquid_assets": 300000
    // }
    
    // target = {
    //     "SSN": "1-122-34-6543",
    //     "CustomerFullName": "Leanne Graham",
    //     "CustomerAddress": "Kulas Light Apt. 556",
    //     "CustomerCity": "Gwenborough",
    //     "CustomerZipCode": "92998-3874",
    //     "CustomerProfession": "SELF",
    //     "CustomerAge": 29,
    //     "LoanHistory": [
    //         {
    //             "principal": 40000,
    //             "periodInYears": 3,
    //             "rateOfInterest": 10,
    //             "interest": 13240,
    //             "collateral": [
    //                 {
    //                     "assetName": "property",
    //                     "estimatedValues": 7000
    //                 }
    //             ],
    //             "collateralValue": 7000
    //         },
    //         {
    //             "principal": 140000,
    //             "periodInYears": 4,
    //             "rateOfInterest": 12,
    //             "isCommercial": true,
    //             "interest": 80292.71,
    //             "collateral": [
    //                 {
    //                     "assetName": "condo",
    //                     "estimatedValues": 30000
    //                 }
    //             ],
    //             "collateralValue": 3000
    //         },
    //         {
    //             "principal": 60000,
    //             "periodInYears": 4,
    //             "rateOfInterest": 12,
    //             "interest": 34411.16,
    //             "collateralValue": 0
    //         }
    //     ],
    //     "TotalAssets": 400000
    // }
    
    target = {}
    let keys = []
    let answers = []
    let indexes = []
    
    function ENUM(key,list_){
        list2 = '';
        for(let i = 0;i < list_.length;i++){
            if(list_[i+1] == ','){
                list2 += ',';
                i += 2;
                continue;
            }
            list2 += list_[i];
        }
        list2 = JSON.parse(list2);
        key_ = final_query(key);
        return result = list2[key_];
        // console.log(list2);
        
    }
    
    function final_query(query){
        let count = 0;
        let result;
        let new_query = '';
        for(let i = 0;i < query.length;i++){
            if(query[i] == '&'){
                count++;
            }
            if(i == query.length - 1 && count == 1){
                let index = query.indexOf('&');
                if(typeof(final_query((query.slice(0,index-1)))) == 'number'){
                    return result = final_query(query.slice(0,index-1)) + final_query(query.slice(index+2,query.length))
                }
                return result = final_query(query.slice(0,index-1)) + ' ' + final_query(query.slice(index+2,query.length))
            }
            if(i == query.length - 1){
                count = 0;
            }
        }
        var expression = jsonata(query);
        result = expression.evaluate(source);
        return result;
    }
    
    fs.readFile(mapping,'UTF-8',function(err,data) {
        data = data.split('\n');
        data = data.slice(1,data.length);
        for(let i = 0;i < data.length;i++){
            data[i] = data[i].split(', ');
            // console.log(data[i])
            if(!data[i][1].includes('.')){
                keys.push(data[i][1])
            }
            if(data[i][1].includes('.item')){
                data[i][1] = data[i][1].replace('.item','');
                let index = data[i][1].indexOf('.');
                let name = data[i][1].slice(0,index);
                keys.push(name);
            }
        }
        // console.log(keys)
        for(let i = 0; i < data.length;i++){
            data[i][2] = data[i][2].split(' ')
            let count = 0;
            // console.log(data[i][2]);
            for(let j = 0; j < data[i][2].length;j++){
                if(data[i][2][j].includes('ENUM')){
                    data[i][2][j] = data[i][2][j].slice(5,data[i][2][j].length - 1);
                    data[i][2][j] = ENUM(data[i][2][j],data[i][3]);
                    if(data[i][2].length == 1){
                        answers.push(data[i][2][0]);
                        indexes.push(i);
                    } 
                }
                if(data[i][2][j] == '+'){
                    data[i][2][j] = data[i][2][j].replace('+','&');
                }
                if(data[i][2][j][0] == '.'){
                    data[i][2][j] = data[i][2][j].replace('.','');
                }
                try{
                    if(data[i][2][j].includes('IF')){
                        data[i][2][j] = data[i][2][j].slice(4,data[i][2][j].length - 1);
                        if(data[i][2][j].includes('.item')){
                           data[i][2][j] = data[i][2][j].replace('.item','');
                            data[i][2][j] += 'list';
                        }
                        if(data[i][2][j+2].includes('.item')){
                            data[i][2][j+2] = data[i][2][j+2].replace('.item','');
                        }
                        // console.log(data[i][2]);
                    }
                    if(data[i][2][j].includes('true')){
                            data[i][2][j] = data[i][2][j].slice(0,data[i][2][j].length-8);
                        data[i][2][j+1] += 'true';
                        }
                    if(data[i][2][j].includes('.item')){
                        data[i][2][j] = data[i][2][j].replace('.item','');
                        data[i][2][j] += 'list';
                    }
                }
                catch(err){
                    data[i][2][j] = data[i][2][j];
                }
            }
        }
        for(let i = 0; i < data.length;i++){
            data[i][2] = data[i][2].join(' ');
            if(!data[i][2].includes('THEN') && !data[i][2].includes('list') && !indexes.includes(i)){
                answers.push(final_query(data[i][2]));
                indexes.push(i);
            }
            if(data[i][2].includes('THEN')){
                
                data[i][2] = data[i][2].split(' ');
                // console.log(data[i][2]);
                if(data[i][2][0].includes('list')){
                    data[i][2][0] = data[i][2][0].replace('list','');
                    let index = data[i][2][0].indexOf('.');
                    let name = data[i][2][0].slice(index + 1,data[i][2][0].length)
                    let name_index = data[i][2][2].indexOf('.');
                    name_index = data[i][2][2].indexOf('.',name_index+2);
                    let second_name = data[i][2][2].slice(name_index+1,data[i][2][2].length);
                    let dict = final_query(data[i][2][0].slice(0,index));
                    // console.log(data[i][2][0].slice(0,index));
                    for(let j = 0;j < dict.length;j++){
                        let index = data[i][1].indexOf('.');
                        let main_name = data[i][1].slice(index+1,data[i][1].length)
                        if(dict[j][name]){
                            dict[j][main_name] = dict[j][name][0][second_name];
                        }
                        else{
                            dict[j][main_name] = 0;
                        }
                        
                    }
                    answers.push(dict);
                    indexes.push(i);
                }
                
            }
            if(data[i][2].includes('THENtrue')){
                let index = data[i][1].indexOf('.');
                let name = data[i][1].slice(0,index);
                let second_name = data[i][1].slice(index+1,data[i][1].length);
                let dict = final_query(name);
                let index_matter = []
                for(let j = 0;j < dict.length;j++){
                    if(dict.second_name){
                        index_matter.push(j)
                    }
                    let new_dict = [];
                    index_matter.forEach((element) => {
                        new_dict.push(dict[element]);
                    })
                    answers.push(new_dict);
                }
                indexes.push(i)
            }
            if(data[i][1].includes('.interest')){
                let name = data[i][2].replace('list','');
                dict = final_query(name);
                for(let j = 0;j < dict.length;j++){
                    dict[j].interest = (dict[j].principal * dict[j].periodInYears * dict[j].rateOfInterest) / 100;
                }
                // console.log(dict);
                answers.push(dict);
                indexes.push(i);
            }
            
        }
        for (i = 0; i < data.length;i++){
            let value_index = indexes.indexOf(i)
            target_file[keys[i]] = answers[value_index];
    }
        // console.log(data);
        // console.log(answers);
        // console.log(indexes);
        // console.log(source === target_file)
    
        var fs = require('fs');
        fs.writeFile("test.txt", jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });
        
    });
}

module.export = produce;