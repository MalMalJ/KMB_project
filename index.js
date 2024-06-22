let routeSearchedList = document.querySelector(".routeSearchedList");
let searchbox = document.querySelector("#searchbox");
let searchBtn = document.querySelector("#searchBtn");
let stopID_name = {};
let stopSearchedList = document.querySelector(".stopList");
let etaList = document.querySelector(".etaList");







window.addEventListener("load", () => {
  const gettingStopNames = axios(
    "https://data.etabus.gov.hk/v1/transport/kmb/stop"
  );
  gettingStopNames.then(function (stopNames_response) {
    for (let stoplist of stopNames_response.data.data) {
      stopID_name[stoplist.stop] = stoplist.name_tc;
    }
  });

  searchBtn.addEventListener("click", function () {
    routeSearchedList.innerHTML = "";
    stopSearchedList.innerHTML = "";

    const routes = axios("https://data.etabus.gov.hk/v1/transport/kmb/route/");

    routes.then(function (response) {
     
      let routes = response.data.data;
      let routeChecked = [];

      for (let route of routes) {
        if (route["route"] == searchbox.value.toUpperCase()) {
          routeChecked.push(route);
        }
      }
      
      for (let i = 0; i < routeChecked.length; i++) {
        
        const routeSearched = document.createElement("button");
        routeSearched.id = `routeNumber-${i}`;
        routeSearched.innerHTML = `${routeChecked[i].orig_tc}->${routeChecked[i].dest_tc}`;
        routeSearchedList.appendChild(routeSearched);
        const selectedRoute = document.querySelector(`#routeNumber-${i}`);

       
        selectedRoute.addEventListener("click", function () {
          stopSearchedList.innerHTML = "";
          let routeboundConverted = "";
          routeboundConverted =
            routeChecked[i].bound == "O" ? "outbound" : "inbound";
          const stop = axios(
            "https://data.etabus.gov.hk/v1/transport/kmb/route-stop/" +
              routeChecked[i].route +
              "/" +
              routeboundConverted +
              "/" +
              routeChecked[i].service_type
          );

          stop.then(function (response) {
            
            let stopInfo;
            let etaClicks = [];
            let stopIDList = [];

            for (let j = 0; j < response.data.data.length; j++) {
              stopInfo = response.data.data[j];
              stopIDList.push(stopInfo.stop);

              
              for (let stopMatching in stopID_name) {
                if (stopInfo.stop == stopMatching) {
                  stopSearchedList.innerHTML += `<div class="stopNumber" tabindex="0" style="border-radius: 20px; padding: 5px" id="stopNumber-${j}"> 
                  ${j + 1} ${stopID_name[stopMatching]}</div>`;
                }
              }
            }

           
            etaClicks = document.querySelectorAll(".stopNumber");

            
            etaClicks.forEach((element, index) => {
              element.addEventListener("focus", function () {
                etaList.innerHTML = "";
                
                const gettingEta = axios(
                  "https://data.etabus.gov.hk/v1/transport/kmb/eta/" +
                    stopIDList[index] +
                    "/" +
                    routeChecked[i].route +
                    "/" +
                    routeChecked[i].service_type
                );
                gettingEta.then(function (etaResponse) {
                  let arrayOfEtas = etaResponse.data.data;
                 
                  let filter_arrayOfEtas = arrayOfEtas.filter(function (info) {
                    return (
                      info.dir == routeChecked[i].bound &&
                      info.service_type == routeChecked[i].service_type &&
                      info.seq == index + 1 
                    );
                  });
                 

                  for (let i = 0; i < filter_arrayOfEtas.length; i++) {
                    const etaTime = filter_arrayOfEtas[i].eta.slice(11, 16);
                    let etaMode = "";
                    
                    if (filter_arrayOfEtas[i].rmk_tc == "") {
                      etaMode = "實時班次";
                    } else {
                      etaMode = filter_arrayOfEtas[i].rmk_tc;
                    }
                    etaList.innerHTML += `<div class="eta">
                    <div>時間</div>
                    <div>${etaTime}</div>
                    <div>${etaMode}</div>
                    </div>`;
                    etaList.classList.add("show");
                  }
                });
              });
              element.addEventListener("blur", function () {
                etaList.classList.remove("show");
              });
            });
            
          });
        });
      }
    });
  });
});
