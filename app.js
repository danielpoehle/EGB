(function () {
    'use strict'; //browser does complain about bad coding

    angular.module('EGB', [])
    .controller('EgbController', EgbController)
    .service('EgbService', EgbService);
    
    EgbController.$inject = ['EgbService'];
    function EgbController(EgbService) {
        let egbList = this;
        
        egbList.Filename = '';
        egbList.tfzbr = [];
        egbList.zughaken = "450kN";
        egbList.haken = ["450kN", "500kN", "850kN"];
        egbList.selectedBr = '';
        egbList.loadComplete = false;
        egbList.mapString = '';
        egbList.nord = false;
        egbList.ost = false;
        egbList.suedost = false;
        egbList.mitte = true;
        egbList.west = false;
        egbList.suedwest = false;
        egbList.sued = false;
        egbList.selectedEgb = [];
        egbList.showSelEgbTable = false;
        egbList.minRegelGrenzlast = 0;
        egbList.minFDGrenzlast = 0;
        egbList.min450 = 0;
        egbList.min500 = 0;
        egbList.min850 = 0;
        
        $(document).ready(function () {
            $('#list').bind('change', handleDialog);
        });
        
        function handleDialog(event) {
            const { files } = event.target;
            const file = files[0];
            
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
                egbList.Egb = JSON.parse(event.target.result);
                const tfz = egbList.Egb.map((a) => a.TFZ);
                egbList.tfzbr = tfz.filter((item, index) => tfz.indexOf(item)===index).sort();
                egbList.loadComplete = true;
                //console.log(egbList.Egb[0]);
            };
        };

        egbList.addToList = function(){            
            const id = $('#add').attr('value');
            if(id !== undefined){
                const selection = egbList.Egb.find((e) => e.LfdNr === id);
                const idList = egbList.selectedEgb.map((s) => s.LfdNr);
                if(!(idList.includes(selection.LfdNr))){
                    selection.wirksam = "ja";
                    egbList.selectedEgb.push(selection);
                }   
            } 
            if(egbList.selectedEgb.length > 0){
                egbList.showSelEgbTable = true;
                egbList.minRegelGrenzlast = Math.min.apply(null, egbList.selectedEgb.map((s) => s.Grenzlast));
                egbList.minFDGrenzlast = Math.min.apply(null, egbList.selectedEgb.map((s) => s.FD_Grenzlast));
                egbList.min450 = Math.min.apply(null, egbList.selectedEgb.map((s) => s['Zughakengrenzlast 450kN']));
                egbList.min500 = Math.min.apply(null, egbList.selectedEgb.map((s) => s['Zughakengrenzlast 500kN']));
                egbList.min850 = Math.min.apply(null, egbList.selectedEgb.map((s) => s['Zughakengrenzlast 850kN']));
                for (let k = 0; k < egbList.selectedEgb.length; k++) {
                    if(egbList.selectedEgb[k].Grenzlast >= egbList.minFDGrenzlast){
                        egbList.selectedEgb[k].wirksam = "nein";
                    }else{
                        egbList.selectedEgb[k].wirksam = "ja";
                    }                    
                }
            }                    
            //console.log(egbList.selectedEgb);
        };

        egbList.removeEgb = function(lfdNr){
            const ind = egbList.selectedEgb.findIndex((s) => s.LfdNr === lfdNr);
            egbList.selectedEgb.splice(ind, 1);
            if(egbList.selectedEgb.length > 0){
                egbList.showSelEgbTable = true;
                egbList.minRegelGrenzlast = Math.min.apply(null, egbList.selectedEgb.map((s) => s.Grenzlast));
                egbList.minFDGrenzlast = Math.min.apply(null, egbList.selectedEgb.map((s) => s.FD_Grenzlast));
                egbList.min450 = Math.min.apply(null, egbList.selectedEgb.map((s) => s['Zughakengrenzlast 450kN']));
                egbList.min500 = Math.min.apply(null, egbList.selectedEgb.map((s) => s['Zughakengrenzlast 500kN']));
                egbList.min850 = Math.min.apply(null, egbList.selectedEgb.map((s) => s['Zughakengrenzlast 850kN']));
                for (let k = 0; k < egbList.selectedEgb.length; k++) {
                    if(egbList.selectedEgb[k].Grenzlast >= egbList.minFDGrenzlast){
                        egbList.selectedEgb[k].wirksam = "nein";
                    }else{
                        egbList.selectedEgb[k].wirksam = "ja";
                    }                    
                }
            }else{
                egbList.showSelEgbTable = false;
                egbList.minRegelGrenzlast = 0;
                egbList.minFDGrenzlast = 0;
            } 
        };

        egbList.filterAndShowegb = function(){
            egbList.selectedEgb = []; 
            egbList.showSelEgbTable = false;
            egbList.minRegelGrenzlast = 0;
            egbList.minFDGrenzlast = 0;                       
            let region = [];
            if(egbList.nord) {region.push("2");}
            if(egbList.ost) {region.push("1");}
            if(egbList.suedost) {region.push("4");}
            if(egbList.mitte) {region.push("5");}
            if(egbList.west) {region.push("3");}
            if(egbList.suedwest) {region.push("6");}
            if(egbList.sued) {region.push("7");}
            egbList.mapString = EgbService.generateMapString(egbList.selectedBr, egbList.Egb, region);
            var mapBBcode = new MapBBCode({
                windowPath: './mapbbcode/',
                layers: 'RailwayMap',
                defaultPosition: [22, 11],
                viewWidth: 1200,
                viewHeight: 600,
                fullViewHeight: 600,
                allowedHTML: 'span|i|h6|br|input|li|ul|p|b|div|label|button|table|thead|tbody|tr|th|td',
                fullFromStart: false,
                fullViewHeight: -1, 
                defaultZoom: 8
            });
            mapBBcode.show('railmap', egbList.mapString);
        };
    }

    function EgbService(){
        let service = this;
        
        service.createPin = function(lat, lon, egb){
            //53.5136232,8.0525981(<h6>Mariensiel</h6>)
            let pin = lat + ',' + lon + '(<h6>' + egb.NameVon.replaceAll(')', "\\)") + ' <i class="fas fa-arrow-alt-circle-right"></i> ' + egb.NameBis.replaceAll(')', "\\)") + '</h6>';           
            pin += '<p id="add" value=' + egb.LfdNr + '><b>BR ' + egb.TFZ + '<br>FD-Grenzlast: ' + egb.FD_Grenzlast + ' t</b></p>';             
            pin += '<ul><li>DS100: ' + egb.RL100von + ' <i class="fas fa-arrow-alt-circle-right"></i> ' + egb.RL100bis + '</li><li>Strecke: ' + egb.StrNr + '</li><li>Regelgrenzlast: ' + egb.Grenzlast + ' t</li>';
            pin += '<li>Signal ' + egb["Freie Signale"].replaceAll(')', "\\)") + '</li></ul>) ';            
            return pin;
        };

        service.generateMapString = function(tfz, egbList, regionen){            
            const filteredEgbList = egbList.filter((b) => regionen.includes(b.NL) && b.TFZ === tfz);
            //console.log(filteredEgbList.length);
            //console.log(filteredEgbList);            
            let allStations = filteredEgbList.map((f) => f.RL100von);
            allStations = allStations.filter((item, index) => allStations.indexOf(item)===index);
            //console.log(allStations);
            let pinString = '[map] ';

            for (let n = 0; n < allStations.length; n += 1) {
                const egbBf = filteredEgbList.filter((f) => f.RL100von === allStations[n]);                
                if(egbBf.length === 1){
                    //console.log('1 Bf ' + egbBf[0].RL100von);
                    pinString += service.createPin(egbBf[0].lat, egbBf[0].lon, egbBf[0]);
                }else{                    
                    const alphaStp = 2 * Math.PI / egbBf.length;
                    let radius = 0.0002;
                    if(egbBf.length > 4){radius = 0.0003;}
                    for (let j = 0; j < egbBf.length; j += 1) {
                        pinString += service.createPin(parseFloat(egbBf[j].lat) + radius * Math.sin(j*alphaStp), 
                                                       parseFloat(egbBf[j].lon) + radius * Math.cos(j*alphaStp), 
                                                       egbBf[j]);                        
                    }
                }                
            };
            //console.log(pinString);
            pinString += ' [/map]';
            return pinString;
        };
    }
})();
