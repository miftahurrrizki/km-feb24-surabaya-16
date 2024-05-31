   //------------------------------ GENERAL FUNCTION ----------------------------------
   const DataUrl = 'http://localhost:3000/data';
            
   // Ambil data dari json
   function fetchData(url) {
       return fetch(url)
           .then(response => {
               if (!response.ok) {
                   throw new Error('Network response was not ok');
               }
               return response.json();
           })
           .catch(error => {
               console.error('There was a problem with the fetch operation:', error);
           });
   }


//------------------------------ SCORE CARD FUNCTION ----------------------------------
function isiDropdownFilter(selectElement, items) {
   if (Array.isArray(items)) {
       items.forEach(function(item) {
           const option = document.createElement('option');
           option.value = item;
           option.textContent = item;
           selectElement.appendChild(option);
       });
   } else {
       console.error('Expected an array but got:', items);
   }
}

// Populasi dropdowns dengan nilai unik dari data
function populateDropdowns(data) {
   const states = [...new Set(data.map(row => row.State))];
   const categories = [...new Set(data.map(row => row.Category))];
   const segments = [...new Set(data.map(row => row.Segment))];

   isiDropdownFilter(document.getElementById('stateSelect'), states);
   isiDropdownFilter(document.getElementById('categorySelect'), categories);
   isiDropdownFilter(document.getElementById('segmentSelect'), segments);
}

// Ambil value Filter
function applyFilters(data) {
   const selectedState = document.getElementById('stateSelect').value;
   const selectedCategory = document.getElementById('categorySelect').value;
   const selectedSegment = document.getElementById('segmentSelect').value;

   return data.filter(row => {
       return (!selectedState || row.State === selectedState) &&
           (!selectedCategory || row.Category === selectedCategory) &&
           (!selectedSegment || row.Segment === selectedSegment);
   });
}

// Hitung Total Sales
function calculateTotalSales(data) {
   let totalSales = 0;
   data.forEach(row => {
       const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));
       totalSales += sales;
   });
   return totalSales;
}

// Hitung Total Profit
function calculateTotalProfit(data) {
   let totalProfit = 0;
   data.forEach(row => {
       const profit = parseFloat(row.Profit.replace(/\$/g, '').replace(/,/g, ''));
       totalProfit += profit;
   });
   return totalProfit;
}

// Hitung Total Orders
function calculateTotalOrders(data) {
   return data.length;
}

// Post To Card
function postDataCard() {
   fetchData(DataUrl).then(data => {
       const filteredData = applyFilters(data);

       const totalOrder = calculateTotalOrders(filteredData);
       const formattedTotalOrder = totalOrder.toLocaleString('en-US');
       document.getElementById('cardOrder').innerText = `${formattedTotalOrder}`;

       // Total Sales
       const totalSales = calculateTotalSales(filteredData);
       const formattedTotalSales = totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
       document.getElementById('cardSales').innerText = `$ ${formattedTotalSales}`;

       // Total Profit
       const totalProfit = calculateTotalProfit(filteredData);
       const formattedTotalProfit = totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
       document.getElementById('cardProfit').innerText = `$ ${formattedTotalProfit}`;

       // Profit Ratio
       const profitRatio = (totalProfit / totalSales) * 100;
       const formattedTotalProfitRatio = Math.round(profitRatio).toLocaleString('en-US');
       document.getElementById('cardProfitRatio').innerText = `${formattedTotalProfitRatio} %`;
   });
}

//------------------------------------------------- KALAU MAU TAMBAH CHART DISINI!!!!! ------------------------------------------------
    
// ------------------------------------- BARCHART STATE HIGHEST SALES -------------------------------------
// Fungsi untuk memproses data penjualan dan mendapatkan negara bagian dengan penjualan tertinggi
function processSalesData(data) {
    const aggregatedData = {};

    data.forEach(row => {
        const state = row.State;
        const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));

        if (aggregatedData[state]) {
            aggregatedData[state] += sales;
        } else {
            aggregatedData[state] = sales;
        }
    });

    // Mengubah objek aggregatedData menjadi array untuk diurutkan
    const sortedDataArray = Object.entries(aggregatedData).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Mengembalikan objek yang diurutkan
    const sortedData = {};
    sortedDataArray.forEach(([state, sales]) => {
        sortedData[state] = sales;
    });

    return sortedData;
}

// Variabel global untuk chart
let BarChartSales = null;

// Fungsi untuk membuat bar chart
function createBarChartSalesState(data) {
    const ctx = document.getElementById("BarChartSalesPerState").getContext("2d");
    if (BarChartSales != null) {
        BarChartSales.destroy(); // Hapus chart sebelumnya jika ada
    }

    BarChartSales = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data), // Label adalah nama negara bagian
            datasets: [
                {
                    label: "Total Sales by State",
                    data: Object.values(data), // Data adalah total penjualan
                    backgroundColor: 'rgba(255, 143, 0, 1)',
                    borderColor: 'rgba(255, 143, 0, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString(); // Format angka menjadi dolar
                        }
                    }
                },
            },
        },
    });
}

// Ambil data sales dari server, proses, dan buat chart
fetchData(DataUrl)
    .then(data => {
        const processedData = processSalesData(data);
        createBarChartSalesState(processedData);
    });

// ------------------------------------- BARCHART STATE HIGHEST PROFIT -------------------------------------
// Fungsi untuk memproses data profit dan mendapatkan profit per negara bagian
function processProfitData(data) {
    const aggregatedData = {};

    data.forEach(row => {
        const state = row.State;
        const profit = parseFloat(row.Profit.replace(/\$/g, '').replace(/,/g, ''));

        if (aggregatedData[state]) {
            aggregatedData[state] += profit;
        } else {
            aggregatedData[state] = profit;
        }
    });

    // Mengubah objek aggregatedData menjadi array untuk diurutkan
    const sortedDataArray = Object.entries(aggregatedData).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Mengembalikan objek yang diurutkan
    const sortedData = {};
    sortedDataArray.forEach(([state, profit]) => {
        sortedData[state] = profit;
    });

    return sortedData;
}

// Variabel global untuk chart
let BarChartProfit = null;

// Fungsi untuk membuat bar chart
function createBarChartProfitState(data) {
    const ctx = document.getElementById("BarChartProfitPerState").getContext("2d");
    if (BarChartProfit != null) {
        BarChartProfit.destroy(); // Hapus chart sebelumnya jika ada
    }

    BarChartProfit = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data), // Label adalah nama negara bagian
            datasets: [
                {
                    label: "Total Profit by State",
                    data: Object.values(data), // Data adalah total profit
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString(); // Format angka menjadi dolar
                        }
                    }
                },
            },
        },
    });
}


// Ambil data profit dari server, proses, dan buat chart
fetchData(DataUrl)
    .then(data => {
        const processedData = processProfitData(data);
        createBarChartProfitState(processedData);
    })

//-------------------------------- LINE CHART MONTHLY SALES PERFORMANCE ----------------------------------
let lineChartInstance = null; // Variabel global untuk menyimpan referensi chart

        // Fungsi untuk memproses data penjualan bulanan
        const preprocessData = (data) => {
            const result = {};

            data.forEach(order => {
                const date = new Date(order["Order Date"]);
                const month = date.toLocaleString('default', { month: 'long' });

                if (!result[month]) {
                    result[month] = { sales: 0 };
                }

                result[month].sales += parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));
            });

            const sortedData = [];

            Object.keys(result).sort((a, b) => {
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return months.indexOf(a) - months.indexOf(b);
            }).forEach(month => {
                sortedData.push({
                    month: month,
                    sales: result[month].sales
                });
            });

            return sortedData;
        };

        // Konfigurasi line chart untuk penjualan bulanan
        const createLineChart = (processedData) => {
            const labelsMonth = processedData.map(data => data.month);
            const sales = processedData.map(data => data.sales);

            const ctxLSP = document.getElementById('LineChartMonthlySales').getContext('2d');

            // Cek apakah chart sudah ada, dan jika ada, hancurkan
            if (lineChartInstance) {
                lineChartInstance.destroy();
            }

            lineChartInstance = new Chart(ctxLSP, {
                type: 'line',
                data: {
                    labels: labelsMonth,
                    datasets: [
                        {
                            label: 'Sales',
                            data: sales,
                            backgroundColor: 'rgba(255, 143, 0, 1)',
                            borderColor: 'rgba(255, 143, 0, 1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.2,
                        }
                    ]
                },
                options: {
                    responsive: true, 
                    maintainAspectRatio: false, 
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        };

        // Fetching data dari JSON
        fetch(DataUrl)
            .then(response => response.json())
            .then(data => {
                const processedDataLineChart = preprocessData(data);
                createLineChart(processedDataLineChart);
            })
            .catch(error => console.error('Error fetching data:', error));

//------------------------------------- TABLE PROFIT PER CATEGORY ---------------------------------------
let totalProfitTable = {}; // Define totalProfitTable globally
let sortedShipModes = [];
let sortDirection = 'desc'; // Initialize sort direction

// Fungsi untuk memproses data profit berdasarkan kategori dan ship mode
function calculateTotalProfitTable(orders) {
    const totalProfit = {};

    orders.forEach(order => {
        const category = order["Category"];
        const shipMode = order["Ship Mode"];
        const profit = parseFloat(order.Profit.replace(/[^0-9.-]+/g, ''));

        if (!totalProfit[shipMode]) {
            totalProfit[shipMode] = { "Office Supplies": 0, "Technology": 0, "Furniture": 0 };
        }

        if (category === "Technology" || category === "Office Supplies" || category === "Furniture") {
            totalProfit[shipMode][category] += profit;
        }
    });

    return totalProfit;
}

// Fungsi untuk menampilkan data pada tabel
function displayProfitTable(totalProfitTable) {
    const tableBody = document.getElementById('profitpercategory-body');

    // Kosongkan isi tabel sebelum menambahkan data baru
    tableBody.innerHTML = '';

    // Tambahkan baris untuk setiap ship mode
    sortedShipModes.forEach(shipMode => {
        const row = `<tr>
                        <td>${shipMode}</td>
                        <td>${totalProfitTable[shipMode]["Office Supplies"].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td>${totalProfitTable[shipMode]["Technology"].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td>${totalProfitTable[shipMode]["Furniture"].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

// Fungsi untuk mengurutkan data berdasarkan total profit
function sortShipModes(totalProfitTable, direction) {
    const shipModes = Object.keys(totalProfitTable);

    shipModes.sort((a, b) => {
        const totalProfitA = totalProfitTable[a]["Technology"] + totalProfitTable[a]["Office Supplies"] + totalProfitTable[a]["Furniture"];
        const totalProfitB = totalProfitTable[b]["Technology"] + totalProfitTable[b]["Office Supplies"] + totalProfitTable[b]["Furniture"];
        return direction === 'asc' ? totalProfitA - totalProfitB : totalProfitB - totalProfitA;
    });

    return shipModes;
}

// Fungsi untuk mengambil data dan memperbarui tabel
function fetchDataAndRenderTable() {
    fetch(DataUrl)
        .then(response => response.json())
        .then(data => {
            totalProfitTable = calculateTotalProfitTable(data);
            sortedShipModes = sortShipModes(totalProfitTable, sortDirection);
            displayProfitTable(totalProfitTable);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Inisialisasi data dan render tabel saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRenderTable();
});

// Fungsi Filter Tabel
function filterTable() {
    fetchData(DataUrl).then(data => {
        const filteredData = applyFilters(data);
        // Use the global total Profit Table variable
        totalProfitTable = calculateTotalProfitTable(filteredData);
        displayProfitTable(totalProfitTable);
    });
}

//------------------------------------- HORIZONTAL BAR CHART MOST PROFITABLE CATEGORY ---------------------------------------
// const ctxVBPS = document.getElementById('VerticalBarchartProfitableCategory').getContext('2d');

// Fungsi untuk memproses data profit per kategori
// function processProfitProductData(data) {
//     const aggregatedData = {};
    
//     data.forEach(row => {
//         const category = row["Category"];
//         const profit = parseFloat(row["Profit"]);
        
        // check unique category terus jumlahkan profitnya
    //     if (aggregatedData[category]) {
    //         aggregatedData[category] += profit;
    //     } else {
    //         // Jika kategori belum ada, tambahkan kategori baru
    //         aggregatedData[category] = profit;
    //     }
    // });
    
    // Urutkan kategori berdasarkan profit dari tertinggi ke terendah
    // const sortedCategories = Object.keys(aggregatedData).sort((a, b) => aggregatedData[b] - aggregatedData[a]);

    // Ambil hanya 3 kategori teratas
    // const top3Categories = sortedCategories.slice(0, 3);

    // Buat objek baru untuk menyimpan hanya 3 kategori teratas
    // const top3Data = {};
    // top3Categories.forEach(category => {
    //     top3Data[category] = aggregatedData[category];
    // });
    
    // return top3Data;

    // }
    
    // let VerticalBarChartProfitable = null;
    
    // Fungsi untuk membuat chart
    // function createVerticalBarChartProfitableCategory(data) {
    //     const ctxVBPS = document.getElementById("VerticalBarChartProfitableCategory").getContext("2d");
    //     if (VerticalBarChartProfitable != null) {
    //         VerticalBarChartProfitable.data.labels = Object.keys(data); // Perbarui labels
    //         VerticalBarChartProfitable.data.datasets.forEach((dataset) => {
    //             dataset.data = Object.values(data); // Perbarui data
    //         });
    //         return VerticalBarChartProfitable.update();
    //     }
    //     VerticalBarChartProfitable = new Chart(ctxVBPS, {
    //         type: "bar",
    //         data: {
    //             labels: Object.keys(data), // Label adalah kategori
    //             datasets: [
    //                 {
    //                     label: "Total Profit per Category",
    //                     data: Object.values(data), // Data adalah total profit
    //                     backgroundColor: [
    //                         'rgba(255, 99, 132, 0.2)',
    //                         'rgba(54, 162, 235, 0.2)',
    //                         'rgba(75, 192, 192, 0.2)'
    //                     ],
    //                     borderColor: [
    //                         'rgba(255, 99, 132, 1)',
    //                         'rgba(54, 162, 235, 1)',
    //                         'rgba(75, 192, 192, 1)'
    //                     ],
    //                     borderWidth: 1
    //                 },
    //             ],
    //         },
    //         options: {
    //             indexAxis: 'y',
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 x: {
    //                     beginAtZero: true,
    //                 },
    //             },
    //         },
    //     });
    // }

    // Ambil data penjualan dari server, proses, dan buat chart
    // function filterVerticalBarChart (){
    // fetchData(DataUrl)
    //     .then(data => {
    //         const filteredData = applyFilters(data);
    //         const processedDataVerticalBarChart = processProfitProductData(filteredData);
    //         createVerticalBarChartProfitableCategory(processedDataVerticalBarChart);
    //     });
    // }

//------------------------------------- HORIZONTAL BAR CHART TOP 10 SALES SUB CATEGORY ---------------------------------------
// Fetch data dari URL
fetchData(DataUrl).then(data => {
    if (!data) return;

    // Memproses data untuk mengumpulkan sales by sub-category
    const subCategorySales = {};

    data.forEach(order => {
        const subCategory = order["Sub-Category"];
        const sales = parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));

        if (!subCategorySales[subCategory]) {
            subCategorySales[subCategory] = 0;
        }

        subCategorySales[subCategory] += sales;
    });

    // Mengubah objek subCategorySales menjadi array [subCategory, sales]
    const salesArray = Object.entries(subCategorySales);

    // Mengurutkan array berdasarkan order dalam descending dan ambil Top 10 sub category
    const top10Sales = salesArray.sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Pisahkan Top 10 sub category dan Sales ke dalam arrays terpisah
    const subCategories = top10Sales.map(item => item[0]);
    const sales = top10Sales.map(item => item[1]);

    // Membuat bar chart
    const ctx = document.getElementById('SubsalesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subCategories,
            datasets: [{
                label: 'Sales by Sub Category',
                data: sales,
                backgroundColor: 'rgba(255, 143, 0, 1)',
                borderColor: 'rgba(255, 143, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
});

fetch(DataUrl)
    .then(response => response.json())
    .then(data => {
        const processedDataLineChart = preprocessData(data);
        createLineChart(processedDataLineChart);
    })
    .catch(error => console.error('Error fetching data:', error));

//--------------------------- BAR CHART THE MOST PROFITABLE AND HIGHEST SALES -----------------------------
// Ambil data dari JSON
// function fetchData(url) {
//     return fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .catch(error => {
//             console.error('There was a problem with the fetch operation:', error);
//         });
// }

// Fungsi untuk mengubah format data
// function processData(data) {
//     const products = {};
    
    // Loop melalui setiap item dalam data
    // data.forEach(item => {
    //     const productName = item["Product Name"];
    //     const profit = parseFloat(item["Profit"].replace("$", "").replace(",", ""));
    //     const sales = parseFloat(item["Sales"].replace("$", "").replace(",", ""));
        
        // Jika nama produk sudah ada dalam objek products, tambahkan profit dan sales
    //     if (products[productName]) {
    //         products[productName].profit += profit;
    //         products[productName].sales += sales;
    //     } else { // Jika tidak, buat entri baru untuk produk tersebut
    //         products[productName] = {
    //             profit: profit,
    //             sales: sales
    //         };
    //     }
    // });
    
    // Mengurutkan produk berdasarkan profit tertinggi
//     const sortedProducts = Object.entries(products).sort((a, b) => b[1].profit - a[1].profit).slice(0, 10);

//     return sortedProducts;
// }

// Membuat chart
// async function createChart() {
//     const data = await fetchData(DataUrl);
//     const processedData = processData(data);
    
//     const productNames = processedData.map(item => item[0]);
//     const profits = processedData.map(item => item[1].profit);
//     const sales = processedData.map(item => item[1].sales);
    
//     const ctx = document.getElementById('myChart').getContext('2d');
//     const myChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: productNames,
//             datasets: [{
//                 label: 'Sales',
//                 data: sales,
//                 backgroundColor: 'rgba(255, 143, 0, 1)',
//                 borderColor: 'rgba(255, 143, 0, 1)',
//                 borderWidth: 1
//             }, {
//                 label: 'Profit',
//                 data: profits,
//                 backgroundColor: 'rgba(0, 0, 0, 1)',
//                 borderColor: 'rgba(0, 0, 0, 1)',
//                 borderWidth: 1 
//             }]
//         },
//         options: {
//             scales: {
//                 xAxes: [{
//                     ticks: {
//                         display: false // Menyembunyikan label di sumbu x
//                     }
//                 }],
//                 yAxes: [{
//                     ticks: {
//                         beginAtZero: true
//                     }
//                 }]
//             }
//         }
//     });
// }

// Panggil fungsi untuk membuat chart
// createChart();

//---------------------------------- BAR CHART TOTAL SALES AND PROFIT ------------------------------------
let myChartInstance = null; // Variabel global untuk menyimpan referensi chart

        // Fungsi untuk mengambil data dari JSON
        function fetchData(url) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }

        // Fungsi untuk menghitung total sales dan total profit
        function calculateSalesProfit(data) {
            let totalSales = 0;
            let totalProfit = 0;

            data.forEach(item => {
                totalSales += parseFloat(item.Sales.replace("$", "").replace(",", ""));
                totalProfit += parseFloat(item.Profit.replace("$", "").replace(",", ""));
            });

            return {
                totalSales: totalSales,
                totalProfit: totalProfit
            };
        }

        // Membuat chart
        async function createChart() {
            const data = await fetchData(DataUrl);
            if (!data) {
                console.error('No data fetched');
                return;
            }
            const { totalSales, totalProfit } = calculateSalesProfit(data);

            const ctx = document.getElementById('salesProfitChart').getContext('2d');

            // Cek apakah chart sudah ada, dan jika ada, hancurkan
            if (myChartInstance) {
                myChartInstance.destroy();
            }

            myChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total Sales', 'Total Profit'],
                    datasets: [{
                        label: 'Amount ($)',
                        data: [totalSales, totalProfit],
                        backgroundColor: [
                            'rgba(255, 143, 0, 1)',
                            'rgba(0, 0, 0, 1)',
                        ],
                        borderColor: [
                            'rgba(255, 143, 0, 1)',
                            'rgba(0, 0, 0, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            ticks: {
                                display: false // Menyembunyikan label di sumbu x
                            }
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Panggil fungsi untuk membuat chart
        createChart();

//------------------------------------^^^^^^^ KALAU MAU TAMBAH CHART DISINI (INI BATASNYA)!!!!! ^^^^^-----------------------------------------
//------------------------------------------------ EVENT LISTENER ------------------------------------------------
// Tambah event listeners ke dropdowns
document.getElementById('stateSelect').addEventListener('change', postDataCard);
document.getElementById('categorySelect').addEventListener('change', postDataCard);
document.getElementById('segmentSelect').addEventListener('change', postDataCard);

// Fetch data, populate dropdowns, dan lakukan kalkulasi awal
fetchData(DataUrl).then(data => {
   populateDropdowns(data);
   postDataCard();
}); 