// JavaScript source code

var baseMSUGradesURL = "https://msugrades.com/course/"; //Base URL for all MSUgrades.com AJAX requests


//Parses Planner page for all professor names
var professor = document.querySelectorAll('td[data-title="Instructor"]');

//Parses Planner page for all course numbers
var course = document.querySelectorAll('td[data-title="Course"]');

//Create a new map to store associated course ID's and professor names
var scheduleMap = new Map();

//Inserts an Avg. GPA column in the schedule builder table
var th  = document.createElement("th");
//Sets the inner HTML of the newly created th element
th.innerHTML = 'Avg. GPA'
th.id = "Th9";
var header = document.querySelector("#MainContent_UCEnrl_rptPlanner_trHeader > tr");
header.appendChild(th);

/*Loops over all courses parsed on the page and strips down the course ID into subject and course number
also strips the professor name to first and last name. Adds each to an array, and sets the course array
to the key in the map, and associated professor as the value to the key.
*/
for(i = 0; i < course.length; i++)
{
    //Stores the resulted course text to the Coursename variable
    var courseName = course[i].innerText;

    //Splits the course into subject and course number
    var courseSplit = courseName.split(" ");
    var subject = courseSplit[0].trim();
    var courseNumber = courseSplit[1].trim();   

    //Stores the resulted professor text to the profName variable
    var profName = professor[i].innerText;

    //Prints out the name to the console for testing
    var lineSplit = profName.split("\n");
    lineSplit = lineSplit[0].trim()
    var nameSplit = lineSplit.split(".");

    //Store the professor first and last name to variables
    var firstName = nameSplit[0].trim();
    var lastName = nameSplit[1].trim();
    var gpa = "N/A";

    //Create an array for the course and the professor containing subject, course number and first name, last name
    var courseArr = [subject, courseNumber];
    var nameArr = [firstName, lastName, gpa];
    
    //Adds the two arrays to a map, course ID is the key, professor name is value
    scheduleMap.set(courseArr, nameArr);
}

//AJAX request to process the msu grades page containing course information
var ajaxCounter = 0;
for (let [key] of scheduleMap.entries()) {
    let httpRequest = new XMLHttpRequest();

    httpRequest.onload = function(){ // when the request is loaded
        processRequest(httpRequest, key);// we're calling our method
    };

    httpRequest.open('GET', baseMSUGradesURL + key[0] + "/" + key[1], true);
    //console.log("REQUEST " + baseMSUGradesURL + key[0] + "/" + key[1]);
    httpRequest.send();
    ajaxCounter++;
}
 
//Function to run once the AJAX request returns
function processRequest(xhr, key) {
    //Check to ensure that the AJAX request returns with State "DONE" (value 4) and status 200
    if (xhr.readyState == 4 && xhr.status == 200) {

        //HTML Response of the AJAX Request, Need to parse the AJAX for the proper data***
        var response = xhr.responseText;

        parser=new DOMParser();
        htmlDoc = parser.parseFromString(response, "text/html");

       //Number of rows in the table of the course page.
        var i = 0;
        let lastColumn = false;
        while(!lastColumn)
        {
            //The id of the row of the table, given by "tab" + the row number (i)
            var tabNumber = "#tab" + String(i);

            //Parses the professor name from the first column of the table
            var container = htmlDoc.querySelector(tabNumber);
            if(container != null)
            {
                i++;
                var nameMatches = container.querySelectorAll("h3");
                var professorName = nameMatches[0].innerText;

                //Parses the average and median GPA from the second column of the table
                var gradeMatches = container.querySelectorAll("p > em");
                if(gradeMatches[0] !== undefined)
                {
                    var avgGPA = gradeMatches[0].innerText;
                    var medianGPA = gradeMatches[1].innerText;
                    //Testing results of professor name, average GPA, and median GPA   
                    //console.log("INITIAL INFO:");
                    //console.log(professorName);
                    //console.log(scheduleMap.get(key)[1]);
                    if(professorName.toLowerCase().includes(scheduleMap.get(key)[1].toLowerCase()))
                    {
                        scheduleMap.get(key)[2] = avgGPA;
                        console.log("PROFESSOR MATCH  " + professorName);
                        console.log(avgGPA);
                        console.log(medianGPA);                       
                    }
                }       
            }
            else
            {
                lastColumn = true;
            }  
        }  
        ajaxCounter--;   
        if(ajaxCounter == 0)
        {
            /*
            for (var [key, value] of scheduleMap.entries()) {
                console.log(key + ' = ' + value);
            }
            */
            insertHTML();
        }   
    }   
}

/*
Function that runs after all AJAX calls are complete. 
Inserts the average gpa scraped from msu grades into the msu schedule builder website next to the appropriate professor name
*/
function insertHTML()
{
    let i =0;
    for (var value of scheduleMap.values()) 
    {
        let td  = document.createElement("td");
        //Sets the inner HTML of the newly created td element to the average gpa from the scheduleMap
        td.innerHTML = value[2];
        td.id = "MainContent_UCEnrl_rptPlanner_tdGPA" + i;
        td.className = "instructor-name";
        let contentDiv = document.querySelector("#MainContent_UCEnrl_rptPlanner_trMeeting_" + i);
        contentDiv.appendChild(td);
        i++;
    }
}