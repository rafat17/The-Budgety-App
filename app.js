//This IIFE controls the functions related to the data manipulation within the JS
var budgetController = (function(){

	var Income = function(id, description, value){

		this.id=id
		this.description=description
		this.value = value 
	}

	var Expense = function(id, description, value){

		this.id = id
		this.description = description
		this.value = value
		this.percentage = -1
	}

	Expense.prototype.calcPercentageforEach = function(totalIncome){

		if(totalIncome > 0){
			this.percentage = Math.round((this.value/totalIncome)*100)
		}else{
			this.percentage = -1
		}

	}

	Expense.prototype.getPercentageforEach = function(){
		return this.percentage
	}

	var calculateTotal = function(type){
		var sum = 0
		
		data.allItems[type].forEach(function(current){
			sum += current.value
		})

		data.total[type] = sum
	}

	var data = {

		allItems: {
			exp: [],
			inc: []
		},

		total: {
			exp: 0,
			inc: 0
		},

		budget: 0,
		percentage: -1
	}

	return {
		addItem: function(type, desc, val){
			
			var newItem, ID

            //Creates a new ID for each new inc or exp added
            if(data.allItems[type].length > 0){
            	ID = data.allItems[type][data.allItems[type].length-1].id + 1
            }else{
            	ID= 0
            }
			
 
            //Creates a new object for each 'inc' or 'exp' 
			if(type === 'inc'){
				newItem = new Income(ID, desc, val);
			}
			else if(type === 'exp'){
				newItem = new Expense(ID, desc, val);
			}

            //push the new item into the desired array
			data.allItems[type].push(newItem)
			return newItem

		},

		deleteItem: function(type, id){

			var ids, index

			//1. Find the exact index position of the item within the array
			//So use the map method to return the unique ids of each array item
			ids = data.allItems[type].map(function(current){
				return current.id
			})

			//2. Return the exact index positioning of the desired item within
			//the ids array
			index = ids.indexOf(id)

			//3. Remove the item with the unique id in the main array
			//Use the splice method to do so

			if(index !== -1){
				data.allItems[type].splice(index, 1)
			}
			

		},

		calculateBudget: function(){

			//1. Calculate the total income and expenses
			calculateTotal('inc')
			calculateTotal('exp')

			//2. Calculate the budget: income - expenses
			data.budget = data.total['inc'] - data.total['exp'] 

			//3. Calculate the percentage of income that we spent
			if(data.total['inc'] > 0){
				data.percentage = Math.round((data.total['exp'] / data.total['inc']) * 100)
			}else{
				data.percentage = -1
			}
			

		},

		calculatePercentages: function(){
			
			data.allItems['exp'].forEach(function(current){
				current.calcPercentageforEach(data.total['inc'])
			})
		},

		getPercentages: function(){
			var allPerc

			allPerc = data.allItems['exp'].map(function(current){
				return current.getPercentageforEach()
			})

			return allPerc
		},

		getBudget: function(){
			
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalInc: data.total['inc'],
				totalExp: data.total['exp']
			}
		},

		testing: function(){
			console.log(data)
		}
	}
	
})()



//This IIFE handles the function related to the UI
var UIController = (function(){


	var DOMStrings = {
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
		expensePercLabel:'.item__percentage',
		dateLabel: '.budget__title--month'
	}

    
    //Formats the number to the appropriate string
	var formatNumber = function(num, type){

			num = Math.abs(num)
			num = num.toFixed(2)

			numSplit = num.split('.')

			int = numSplit[0]
			if(int.length > 3){
				int  = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
			}

			dec = numSplit[1]

			if(type === 'N/A'){
				return int + '.' + dec
			}

			return (type === 'inc' ? '+' : '-') + int + '.' + dec
		}

		//the function to iterate over nodelist and apply a function to them
		var nodeListforEach = function(list, callback){

				for(i=0; i < list.length; i++){
					callback(list[i], i)
				}
			}



	return {
		getInput: function(){

			return {
			type: document.querySelector(DOMStrings.inputType).value, //Will be either inc or exp
			desc: document.querySelector(DOMStrings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMStrings.inputValue).value) 
			}
			
		},

		addListItem: function(obj, type){

			var html, newhtml, element

			//Create HTML with placeholder text

			if(type === 'inc'){

			element = DOMStrings.incomeContainer

			html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>'+
			'<div class="right clearfix"><div class="item__value">%value%</div>'+
			'<div class="item__delete"><button class="item__delete--btn">'+
			'<i class="ion-ios-close-outline"></i></button></div></div></div>'}
			
			else if(type === 'exp'){

			element = DOMStrings.expensesContainer

			html = '<div class="item clearfix" id="exp-%id%">'+
            '<div class="item__description">%description%</div>'+
            '<div class="right clearfix">'+
            '<div class="item__value">%value%</div>'+
            '<div class="item__percentage">21%</div>'+
            '<div class="item__delete"><button class="item__delete--btn">'+
            '<i class="ion-ios-close-outline"></i></button>'+'</div></div></div>'
			}

			

			//Replace the placeholder text with actual data
			newhtml = html.replace('%id%', obj.id)
			newhtml = newhtml.replace('%description%', obj.description)
			newhtml = newhtml.replace('%value%', formatNumber(obj.value, type))

			//Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newhtml)

		},

		deleteListItem: function(selectorID){
			var target = document.getElementById(selectorID)
			target.parentNode.removeChild(target)
		},

		clearFields: function(){
			
			var fields, fieldsArray
			
			fields = document.querySelectorAll(DOMStrings.inputDescription+','+DOMStrings.inputValue)
			fieldsArray = Array.prototype.slice.call(fields)

			// console.log(fields)
			// console.log(fieldsArray)

			fieldsArray.forEach(function(current, index, array){
				current.value = ""
			})

			fieldsArray[0].focus()

		},

		displayBudget: function(obj){

			var type

			if(obj.budget < 0){
				document.querySelector(DOMStrings.budgetLabel).textContent = 0
			}
			else{
				document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, 'N/A')
			}
			
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc') 
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')

			if(obj.percentage > 0){
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
			}else{
				document.querySelector(DOMStrings.percentageLabel).textContent = 'N/A'
			}
			
		},

		displayPercentages: function(percentages){

			var fields = document.querySelectorAll(DOMStrings.expensePercLabel)
	
            
            //Custom forEach function for fields iteration
  			nodeListforEach(fields, function(current, index){
				
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%'
				}else{
					current.textContent = 'N/A'
				}
			})

		},

		displayDate: function(){
			var now, month, year

			now = new Date()
			month = now.getMonth()
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
			'September', 'October', 'November', 'December']
			year = now.getFullYear()

			document.querySelector(DOMStrings.dateLabel).textContent = months[month]+' '+year

		},

		changedType: function(){
			var fields = document.querySelectorAll(DOMStrings.inputType + ','
				+ DOMStrings.inputDescription + ',' 
				+ DOMStrings.inputValue)


			nodeListforEach(fields, function(current){
				current.classList.toggle('red-focus')
			})

			if(fields[0].value === 'exp'){
				document.querySelector(DOMStrings.inputBtn).innerHTML = 'Add Expense <i class="ion-ios-checkmark-outline"></i>'
			}else{
				document.querySelector(DOMStrings.inputBtn).innerHTML = 'Add Income <i class="ion-ios-checkmark-outline"></i>'
			}

			document.querySelector(DOMStrings.inputBtn).classList.toggle('red')
		},

		getDOMStrings:  function(){
			return DOMStrings
		}
	}

})()



//acts as a controller for both UIController and budgetController
var controller = (function(budgetCtrl, UICtrl){

	var setupEventListeners = function(){

		var DOM = UICtrl.getDOMStrings()

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
		document.addEventListener('keypress', function(event){

		if(event.keyCode === 13 || event.which === 13){
			ctrlAddItem()
		}
	})
        
        //add event bubbling for this div tag and its target parent child elements
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

		//controls the changes of one div on the other targeted elements
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
  
  }

  //optional function 
  function focusonDescInputField(){
  	var DOM  = UICtrl.getDOMStrings()
  	document.querySelector(DOM.inputDescription).focus()
  }


  function updateBudget(){

  	//5. Calculate the budget
  	budgetController.calculateBudget()

  	//6. Return the budget
  	var budget = budgetController.getBudget()

	//7. Display the budget on the UI
	UICtrl.displayBudget(budget)
  }


    function updatePercentages(){
    	
    	//1. Calculate the percentages of each expense item
    	budgetCtrl.calculatePercentages()

    	//2. Read the percentage from the budget controller
    	var percentages = budgetCtrl.getPercentages()

    	//3. Update the UI with the new percentages
    	UICtrl.displayPercentages(percentages)
    }

	var ctrlAddItem = function(){

		var input, newItem

		//1. Get the input field data
		input = UICtrl.getInput()

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			
			//2. Add the data to the budget controller
			newItem = budgetController.addItem(input.type, input.desc, input.value)

			//3. Add the data to the UI controller
			UICtrl.addListItem(newItem, input.type)

			//4. Clear the input fields
			UICtrl.clearFields()

			//5. Update the budget calculation and report the status to the UI
			updateBudget()

			//6. Update the percentage expenses of each expense item
			updatePercentages()

		}
		else{
			focusonDescInputField()
		}
		
	}


	var ctrlDeleteItem = function(event){

		var itemID 
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

		if(itemID){
			splitID = itemID.split('-')
			type = splitID[0]
			ID = parseInt(splitID[1])

			//1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID)

			//2. Delete the item from the UI
			UICtrl.deleteListItem(itemID)

			//3. Update the budget calculation and status on both the UI and budgetcontroller
			updateBudget()

			//4. Update the percentage of each expense item
			updatePercentages()
		}


	}

	return {
		
		init: function(){
			
			console.log('Application has started !')
			UICtrl.displayDate()
			UICtrl.displayBudget({
				budget: 0,
				percentage: 0,
				totalInc: 0,
				totalExp: 0
			})
			setupEventListeners()
		}

	}


})(budgetController, UIController)


controller.init()