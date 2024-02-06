//On fixe le format d'une page web
interface IWebBrowser {
    url : string,
    htmlCode : any,
}


//MOCK DATA
const parser = new DOMParser();
var indexHtml:string = "<html><h1>INDEX</h1><a href=\"./child1.html\">child1</a><a href=mailto:nullepart@mozilla.org>Envoyer l'email nulle part</a></html>"
var child1Html:string = "<html><h1>CHILD1</h1><a href=\"./index.html\">index</a><a href=\"./child2.html\">child2</a><a href=mailto:ailleurs@mozilla.org>Envoyer l'email ailleurs</a><a href=mailto:nullepart@mozilla.org>Envoyer l'email nulle part</a></html>"
var child2Html:string = "<html><h1>CHILD2</h1><a href=\"./index.html\">index</a><a href=mailto:loin@mozilla.org>Envoyer l'email loin</a><a href=mailto:nullepart@mozilla.org>Envoyer l'email nulle part</a><html>"


//MOCK DATA
var index : IWebBrowser = {
    url : "./index.html",
    htmlCode : parser.parseFromString(indexHtml, "text/html")
}

var child1 : IWebBrowser = {
    url : "./child1.html",
    htmlCode : parser.parseFromString(child1Html, "text/html")
}

var child2 : IWebBrowser = {
    url : "./child2.html",
    htmlCode : parser.parseFromString(child2Html, "text/html")
}

//La classe qui permet d'aspirer les DATA
class WebCrawler {

    link : string[] = []        // tableau des liens glanés
    emailArray : string[] = []  // Tableau des email glanés
    nbrTour : number = 0;       // pour compter le nombre de tour de la fonction GetEmailsInPageAndChildPages qui est récursive

    constructor(){}

    // Pour parser le HTML cette fonction est récursive
    lookingForChildren(obj : any, depth : number){
        for (var i = 0; i< obj.childNodes.length; i++){
            if (obj.childNodes[i].tagName == 'A'){
                var attrHref = obj.childNodes[i].getAttribute("href")
                if (depth >= 0 && attrHref.indexOf("./") == 0) this.link.push(attrHref)
                if (attrHref.indexOf("mailto:") == 0) this.emailArray.push(attrHref.replace("mailto:", ""))
            }
            if (obj.childNodes[i]) this.lookingForChildren(obj.childNodes[i], depth)
        }
    }

    // Pour enlever les doublons dans les tableaux
    removeDuplicates(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }

    GetEmailsInPageAndChildPages (page: IWebBrowser, depth : number) : string[]{
        if (this.nbrTour == 0) this.link.push(page.url)
        this.nbrTour ++
        var linkState = this.link.length
        
        this.lookingForChildren(page.htmlCode, depth - 1)

        if (this.link.length > linkState) {
            this.link = this.removeDuplicates(this.link)
        }
        if (this.link.length > linkState && depth > 0) {
            var newPageToLoad = this.loadHTMLPage(this.link.pop())
            this.GetEmailsInPageAndChildPages (newPageToLoad, depth-1)
        }
        
        this.nbrTour ++
        
        this.emailArray = this.removeDuplicates(this.emailArray) // On tire le tableau finale
        return this.emailArray
    }

    //mock loading des pages
    loadHTMLPage (url : string) {
        if (url == "./index.html") return index;
        if (url == "./child1.html") return child1;
        if (url == "./child2.html") return child2;
    }
    
}



var crawler : WebCrawler = new WebCrawler();
crawler.GetEmailsInPageAndChildPages(index, 2)
console.log("finale", crawler.emailArray)