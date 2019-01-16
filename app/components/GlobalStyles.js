import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    position: relative;
    color: white;
    height: 100vh;
    font-family: Arial, Helvetica, Helvetica Neue, serif;
    overflow-y: hidden;
    margin: 0;
    user-select: none;
  }

  h2 {
    margin: 0;
    font-size: 2.25rem;
    font-weight: bold;
    letter-spacing: -0.025em;
    color: #fff;
  }

  p {
    font-size: 24px;
  }

  li {
    list-style: none;
  }

  a ,
  a:hover {
    color: white;
    text-decoration: none;
    cursor: pointer;
  }
`;
