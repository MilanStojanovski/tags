import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import url from "url";
import axios from "axios";

import TextFieldGroup from "../common/TextFieldGroup";

import { addLink, getLinks } from "../../actions/linkActions";

class Dashboard extends Component {
    state = {
        url: "",
        text: ""
    };

    componentDidMount() {
        this.props.getLinks();
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    isSame = (link1, link2) => {
        link1 = url.parse(link1);
        link2 = url.parse(link2);
        let sortedSearch1 = link1.search
            ? link1.search
                  .split("")
                  .sort()
                  .join("")
            : "";
        let sortedSearch2 = link2.search
            ? link2.search
                  .split("")
                  .sort()
                  .join("")
            : "";

        if (
            link1.host !== link2.host ||
            link1.path !== link2.path ||
            sortedSearch1 !== sortedSearch2
        ) {
            return false;
        }
        return true;
    };

    textAnalysis = text => {
        const stopwords = [
            "",
            "\n",
            "\n\n",
            " ",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "0",
            "one",
            "two",
            "three",
            "four",
            "five",
            "about",
            "actually",
            "always",
            "even",
            "given",
            "into",
            "just",
            "not",
            "Im",
            "thats",
            "its",
            "arent",
            "weve",
            "ive",
            "didnt",
            "dont",
            "the",
            "of",
            "to",
            "and",
            "a",
            "in",
            "is",
            "it",
            "you",
            "that",
            "he",
            "was",
            "for",
            "on",
            "are",
            "with",
            "as",
            "I",
            "his",
            "they",
            "be",
            "at",
            "one",
            "have",
            "this",
            "from",
            "or",
            "had",
            "by",
            "hot",
            "but",
            "some",
            "what",
            "there",
            "we",
            "can",
            "out",
            "were",
            "all",
            "your",
            "when",
            "up",
            "use",
            "how",
            "said",
            "an",
            "each",
            "she",
            "which",
            "do",
            "their",
            "if",
            "will",
            "way",
            "many",
            "then",
            "them",
            "would",
            "like",
            "so",
            "these",
            "her",
            "see",
            "him",
            "has",
            "more",
            "could",
            "go",
            "come",
            "did",
            "my",
            "no",
            "get",
            "me",
            "say",
            "too",
            "here",
            "must",
            "such",
            "try",
            "us",
            "own",
            "oh",
            "any",
            "youll",
            "youre",
            "also",
            "than",
            "those",
            "though",
            "thing",
            "things"
        ];
        let keywordMap = {};
        let words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            let counter = 1;
            if (
                words[i].indexOf("<") !== -1 ||
                words[i].indexOf(">") !== -1 ||
                words[i].indexOf(";") !== -1 ||
                words[i].indexOf(":") !== -1 ||
                words[i].indexOf('"') !== -1
            ) {
                continue;
            }
            if (keywordMap[words[i]] || stopwords.includes(words[i])) {
                continue;
            }
            for (let j = i + 1; j < words.length; j++) {
                if (words[i] === words[j]) {
                    counter++;
                }
            }
            keywordMap[words[i]] = counter;
        }
        let frequentWords = [];
        var sortable = [];
        for (let tag in keywordMap) {
            sortable.push([tag, keywordMap[tag]]);
        }

        sortable.sort((a, b) => {
            return b[1] - a[1];
        });
        for (let i = 0; i < sortable.length && i < 10; i++) {
            if (sortable[i][1] > 1) {
                frequentWords.push(sortable[i][0]);
            }
        }

        return frequentWords;
    };

    validURL = str => {
        var pattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
                "(\\#[-a-z\\d_]*)?$",
            "i"
        ); // fragment locator
        return !!pattern.test(str);
    };

    mostFrequentTags = links => {
        let urlQueries = links.map(link => url.parse(link.url).search);
        let keywordMap = {};
        let mft = [];

        for (let i = 0; i < urlQueries.length; i++) {
            if (urlQueries[i]) {
                let tempTags = urlQueries[i].substring(1).split(/[=&?]+/);
                let tags = [];
                for (let i = 0; i < tempTags.length; i += 2) {
                    // take every second element
                    tags.push(tempTags[i]);
                }
                for (let j = 0; j < tags.length; j++) {
                    if (!keywordMap[tags[j]]) {
                        keywordMap[tags[j]] = 1;
                    } else {
                        keywordMap[tags[j]]++;
                    }
                }
            }
        }
        var sortable = [];
        for (let tag in keywordMap) {
            sortable.push([tag, keywordMap[tag]]);
        }

        sortable.sort((a, b) => {
            return b[1] - a[1];
        });
        for (let i = 0; i < sortable.length && i < 5; i++) {
            mft.push(sortable[i][0]);
        }
        return mft;
    };

    onSubmit = () => {
        let { url } = this.state;
        let newUrl;
        let { links } = this.props.links;
        if (url.indexOf("?") === -1 || url.indexOf("?") === url.length - 1) {
            alert("At least one tag");
            return;
        }
        if (!this.validURL(url)) {
            alert("Wrong URL");
            return;
        }
        if (url.substring(0, 4) !== "http") {
            newUrl = "http://" + url;
        } else {
            newUrl = url;
        }
        let same = false;
        links.forEach(link => {
            let newLinkUrl;
            if (link.url.substring(0, 4) !== "http") {
                newLinkUrl = "http://" + url;
            } else {
                newLinkUrl = link.url;
            }
            if (this.isSame(newUrl, newLinkUrl)) {
                same = true;
            }
        });
        if (same) {
            alert("Most frequent tags are: " + this.mostFrequentTags(links));
        }

        axios
            .get("http://localhost:5000/api/links/getResource?url=" + newUrl)
            .then(res => {
                console.log(res.data.response);
                console.log(this.textAnalysis(res.data.response));
                alert(res);
            })
            .catch(err => console.log(err));

        this.mostFrequentTags(links);

        this.props.addLink({ url: newUrl });
        this.setState({ url: "" });
    };

    render() {
        const { user } = this.props.auth;
        const { links } = this.props.links;
        const displayLinks = links.map((link, index) => {
            return <li key={index}>{link.url}</li>;
        });

        return (
            <div className="dashboard">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <TextFieldGroup
                                name="url"
                                placeholder="Link"
                                type="text" // Don't need to be added because its a default value
                                value={this.state.url}
                                onChange={this.onChange}
                            />
                            <button onClick={this.onSubmit}>Submit Link</button>
                            <ul>{displayLinks}</ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Dashboard.propTypes = {
    auth: PropTypes.object.isRequired,
    getLinks: PropTypes.func.isRequired,
    addLink: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    links: state.links
});

export default connect(mapStateToProps, { getLinks, addLink })(Dashboard);
