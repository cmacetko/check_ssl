var https = require('https');
var async = require('async');
var moment = require('moment');

function doRequest(options) {

    return new Promise(function (resolve, reject) {

        try {
            
            var Req = https.request(options, function (res) {
                
                resolve(res.connection.getPeerCertificate(true));

            }).on('error', function(e){
    
                reject(e);

            });

            Req.end();
        
        } catch(err) {

            reject(err);
            
        }
        
    });

}

var ListSites = "google.com";
var ListSites = ListSites.split(";");
var ListOK  = [];
var ListFALHA  = [];

async.eachSeries(
ListSites, 
async function(HashReg){

    console.log(">> " + HashReg + " <<");
    console.log("");

    try {
     
        var CtrlOptions = {
        host: HashReg,
        port: 443,
        method: 'GET'
        };

        var DadInfo = await doRequest(CtrlOptions);
        var DiffDate1 = moment(DadInfo.valid_to, "MMM D H:mm:ss YYYY").diff(moment(), "days");    
        var DiffDate2 = moment(DadInfo.issuerCertificate.valid_to, "MMM D H:mm:ss YYYY").diff(moment(), "days");

        if( DiffDate1 <= 0 ){

            ListFALHA.push({ HashReg, Mensagem: "SSL Expirado a " + DiffDate1 + " dias" });

        }else if( DiffDate2 <= 0 ){

            ListFALHA.push({ HashReg, Mensagem: "Root Expirado a " + DiffDate2 + " dias" });

        }else{

            ListOK.push({ HashReg });

        }
    
        console.log("Site - CN: " + DadInfo.subject.CN);
        console.log("Site - Expiracao: " + DadInfo.valid_to + " (em " + DiffDate1 +" dias)");
        console.log("Site - Valido: " + (( DiffDate1 > 0 ) ? "SIM" : "NAO" ));

        console.log("");

        console.log("Root - CN: " + DadInfo.issuerCertificate.subject.CN + " (em " + DiffDate2 +" dias)");
        console.log("Root - Expiracao: " + DadInfo.issuerCertificate.valid_to);
        console.log("Root - Valido: " + (( DiffDate2 > 0 ) ? "SIM" : "NAO" ));

        console.log("");
        console.log("--------------------------");
        console.log("");
        
    } catch(err) {

        ListFALHA.push({ HashReg, Mensagem: err.message });

    }

    return true;
    
}, function(){

    console.log("");

    console.log("####################################");
    console.log(">> RESULTADO FINAL <<");
    console.log("####################################")
    console.log("");
    console.log("");
    console.log("Sites OK: " + ListOK.length);
    console.log("Sites com FALHA: " + ListFALHA.length);

    if( ListFALHA.length > 0 )
    {

        console.log("");
        console.log("");

        console.log("####################################");
        console.log(">> PROBLEMAS <<");
        console.log("####################################")
        console.log("");
        console.log("");
        
        Object.entries(ListFALHA).forEach((RegCod, RegValue) => {
        
            console.log("> " + ListFALHA[RegValue].HashReg + ": " + ListFALHA[RegValue].Mensagem);

        });

    }

});

