let db;

const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true })
}

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadBudget()
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

// this will run if we attempt to submit a new budget and there is no internet
function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite')

    const budgetObjectStore = transaction.objectStore('new_budget')

    budgetObjectStore.add(record)
}

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite')

    const budgetObjectStore = transaction.objectStore('new_budget')

    const getAll = budgetObjectStore.getAll()

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            // or api/transaction/bulk ?
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }

              const transaction = db.transaction(['new_budget'], 'readwrite');

              const budgetObjectStore = transaction.objectStore('new_budget');
              // clear all items in your store
              budgetObjectStore.clear();
    
              alert('All saved budgets has been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
    };
}

window.addEventListener('online', uploadBudget)