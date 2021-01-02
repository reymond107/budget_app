// BUDGET CONTROLLER
let budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }

    }

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1

    }



    return {
        addItem: function(type, des, val) {

            let newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // crate new item based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            data.allItems[type].push(newItem);



            return newItem;
        },


        deleteItem: function(type, id) {
            let ids = data.allItems[type].map(function(current) {
                return current.id
            });

            index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //cakculate the budget : icome - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        storeData: function() {
            localStorage.setItem('data', JSON.stringify(data));
        },

        deleteData: function() {
            localStorage.removeItem('data');
        },

        getStoredData: function() {
            localData = JSON.parse(localStorage.getItem('data'));
            return localData;
        },

        updateData: function(StoredData) {
            data.totals = StoredData.totals;
            data.budget = StoredData.budget;
            data.percentage = StoredData.percentage;

        },

        testing: function() {
            console.log(data);
        }

    };

})();

// UI CPNTROLLER
let UIController = (function() {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',

    }

    let formatNumber = function(num, type) {
        let numSplit, int, dec;
        /* 
        + or - before the number
        exactly two decimal points
        comma separating the thousands
        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            // input 23105 -> output 23,105
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either income or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;
            // create  HTML string with placeholder text
            if (type === 'inc') {

                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"> <div 
                class="item__description">%description%</div><div class="right clearfix"><div 
                class="item__value">%value%</div><div class="item__delete"><button 
                class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>           
                </div>`;
            } else if (type === 'exp') {

                element = DOMstrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-%id%"> <div 
                class="item__description">%description%</div><div class="right clearfix"><div 
                class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button 
                class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>           
                </div>`;
            }
            // replace HTML string with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            let el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },

        clearFields: function() {

            let fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
        },

        displayBudget: function(obj, type) {
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage} %`;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--'
            }



        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            let nodeListForEach = function(list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            })
        },

        displayMonth: function() {
            let month, months, year;

            let now = new Date();
            // let christmas = new Date(2018, 11, 25);

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {
            var fields;

            fields = document.querySelectorAll(
                `
                ${DOMstrings.inputType},
                ${DOMstrings.inputDescription},
                ${DOMstrings.inputValue}
                `
            );

            fields.forEach(function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function() {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    let loadData = function() {

        var storedData, newIncItem, newExpItem;

        // 1. load the data from the local storage
        storedData = budgetCtrl.getStoredData();

        if (storedData) {
            // 2. insert the data into the data structure
            budgetCtrl.updateData(storedData);

            // 3. Create the Income Object
            storedData.allItems.inc.forEach(function(cur) {
                newIncItem = budgetCtrl.addItem('inc', cur.description, cur.value)
                UICtrl.addListItem(newIncItem, 'inc');
            });

            // 4. Create the Expense Objects
            storedData.allItems.exp.forEach(function(cur) {
                newExpItem = budgetCtrl.addItem('exp', cur.description, cur.value)
                UICtrl.addListItem(newExpItem, 'exp');
            });

            // 5. Display the Budget
            budget = budgetCtrl.getBudget();
            UICtrl.displayBudget(budget);

            // 6. Display the Percentages
            updatePercentages();
        }
    };

    let updatePercentages = function() {
        // calculate percentages
        budgetCtrl.calculatePercentages();
        // read percentages from budget controller
        let percentages = budgetCtrl.getPercentages();
        // update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    let updateBudget = function() {
        //calculate the budget
        budgetCtrl.calculateBudget();
        //return the budget
        let budget = budgetCtrl.getBudget();
        //display the budget on the UI
        UICtrl.displayBudget(budget)
    };

    let ctrlAddItem = function() {

        let input, newItem;

        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();
            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();


            budgetCtrl.storeData();

        }

    };

    let ctrlDeleteItem = function(event) {

        let itemID, splitID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // console.log(itemID);

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            // delete the item from the user interface
            UICtrl.deleteListItem(itemID)
                // update and show the new budget 
            updateBudget();

            budgetCtrl.deleteData();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            loadData();

        }
    }

})(budgetController, UIController);


controller.init();