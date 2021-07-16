import React, { Component } from "react";

export default class Comments extends Component {

  // constructor(props) {
  //   super(props);
  //   this.commentBox = React.createRef();
  // }

  componentDidMount() {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    //script.setAttribute("async");
    script.setAttribute("repo", "luanasauer/ignite-criando-projeto-do-zero-ds05-ChapterIII");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    anchor.appendChild(script);

  }

  render() {
    return (
      <div id="inject-comments-for-uterances"></div>

    );
  }
}