import React from 'react'
import Accordion from 'react-bootstrap/Accordion'
import { Button } from 'react-bootstrap'
import logo from '../logo-v1.png'
import Adds from './Adds'
import Modal from 'react-bootstrap/Modal'

const defaultOptions = {
  jsPDF: {
    unit: 'px',
    format: 'a4',
  },
  html2canvas: {
    imageTimeout: 15000,
    logging: true,
    useCORS: true,
  },
  imageType: 'image/jpeg',
  imageQuality: 1,
  margin: {
    top: 10,
    right: 0,
    bottom: 10,
    left: 0,
  },
  output: 'Columbia-Community-Connection-Posts.pdf',
  init: function () {},
  success: function (pdf) {
    pdf.save(this.output)
  },
  watermark({ pdf, pageNumber, totalPageNumber }) {
    pdf.setTextColor('gray')
    pdf.text(375, 20, `Page : ${pageNumber}/${totalPageNumber}`)
  },
}

export default class Obituaries extends React.Component {
  constructor() {
    super()
    this.state = {
      posts: [],
      isloading: false,
      isDownloading: false,
      selectedPosts: 0,
      adsToShow: [],
      showModal: false,
      textToShow: '',
      fontSize:'medium'
    }
  }

  handleFontChange=(e)=>{
    this.setState({
      fontSize: e.target.value
    })
  }

  componentDidMount() {
    this.setState({ isloading: true })
    fetch('/api/obituaries-data', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((r) => {
        this.puringfyingHtml(r)
      })
    this.watherFun(document, 'script', 'weatherwidget-io-js')
    let random = [
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
    ]
    this.setState({
      adsToShow: random,
    })
  }

  returnToday = () => {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    var yyyy = today.getFullYear()
    return (today = mm + '/' + dd + '/' + yyyy)
  }

  puringfyingHtml = (html) => {
    let pureHTML = []
    html.map((item, i) => {
      let str = item.html

      let pubDate = str.substring(
        str.lastIndexOf('<pubdate>') + 9,
        str.lastIndexOf('</pubdate>') - 5
      )

      let publisher = str.substring(
        str.lastIndexOf('<dc:creator>') + 12,
        str.lastIndexOf('</dc:creator>')
      )

      let partToRemove = str.substring(
        str.lastIndexOf(']]&gt'),
        str.lastIndexOf('</media:title>')
      )
      let res = str.replace(partToRemove, '')

      partToRemove = res.substring(
        res.lastIndexOf('</title>') + 8,
        res.lastIndexOf('</guid>')
      )

      res = res.replace(partToRemove, '')

      pureHTML.push({
        postID: 'post_' + i,
        title: item.title,
        html: res,
        publishDate: pubDate,
        publisher: publisher,
        isChecked: false,
      })
      this.setState({ posts: pureHTML, isloading: false })
    })
    return pureHTML
  }

  watherFun = (d, s, id) => {
    var js,
      fjs = d.getElementsByTagName(s)[0]
    if (!d.getElementById(id)) {
      js = d.createElement(s)
      js.id = id
      js.src = 'https://weatherwidget.io/js/widget.min.js'
      fjs.parentNode.insertBefore(js, fjs)
    }
  }

  handleSelectPost = (post) => {
    if (!post.isChecked && this.state.selectedPosts >= 5) {
      this.setState({
        showModal: true,
        textToShow:
          'Hold your horses partner, we have a max of 5 stories on a single print right now to keep your printer happy.',
      })
    } else {
      let element = this.state.posts
      let newPosts = []
      for (let i = 0; i < this.state.posts.length; i++) {
        let p = element[i]
        if (post.postID === element[i].postID) {
          if (post.isChecked) {
            p.isChecked = false
            this.setState({ selectedPosts: this.state.selectedPosts - 1 })
          } else {
            this.setState({ selectedPosts: this.state.selectedPosts + 1 })
            p.isChecked = true
          }
        }
        newPosts.push(p)
      }
      this.setState({
        posts: newPosts,
      })
    }
  }

  injectImages = (val) => {
    return <img className='add-img' src={`/images/Add_${val}.png`} />
  }

  handleDownload = async () => {
    const html2PDF = (await import('jspdf-html2canvas')).default
    if (this.state.selectedPosts <= 0) {
      this.setState({
        showModal: true,
        textToShow: 'Please select any post to download.',
      })
      return
    }
    const addImages = document.querySelectorAll('.add-img')
    addImages.forEach((element) => {
      element.classList.add('download-pdf')
    })

    let main = document.getElementById('main')
    let downloadBtn = document.getElementById('downloadBtn')
    let myPDf = document.getElementById('pdf-container')
    let dis = document.getElementById('display-container')
    document.getElementById('hide').style.display = 'none'
    myPDf.style.display = 'block'
    dis.style.display = 'none'
    downloadBtn.style.display = 'none'
    main.style.border = 'none'
    this.setState({ isDownloading: true })
    const pdf = await html2PDF(main, defaultOptions)

    myPDf.style.display = 'none'
    dis.style.display = 'block'
    downloadBtn.style.display = 'block'
    main.style.border = '2px solid darkgray'
    this.setState({ isDownloading: false })
    addImages.forEach((element) => {
      element.classList.remove('download-pdf')
    })
  }

  handlePrint = () => {
    if (this.state.selectedPosts <= 0) {
      this.setState({
        showModal: true,
        textToShow: 'Please select any post to download.',
      })
      return
    }
    window.print()
  }

  hidePopup = () => {
    this.setState({
      showModal: false,
      textToShow: '',
    })
  }

  render() {
    const Loader = () => (
      <div className='loader-container'>
        <svg
          className='loader'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 340 340'
        >
          <circle cx='170' cy='170' r='160' stroke='#E2007C' />
          <circle cx='170' cy='170' r='135' stroke='#404041' />
          <circle cx='170' cy='170' r='110' stroke='#E2007C' />
          <circle cx='170' cy='170' r='85' stroke='#404041' />
        </svg>
      </div>
    )

    const CustomButton = (props) => (
      <div className={`buttons ${props.customClass}`}>
        <button className='blob-btn' onClick={props.handleClick}>
          {props.text}
          <span className='blob-btn__inner'>
            <span className='blob-btn__blobs'>
              <span className='blob-btn__blob'></span>
              <span className='blob-btn__blob'></span>
              <span className='blob-btn__blob'></span>
              <span className='blob-btn__blob'></span>
            </span>
          </span>
        </button>
        <br />

        <svg xmlns='http://www.w3.org/2000/svg' version='1.1'>
          <defs>
            <filter id='goo'>
              <feGaussianBlur
                in='SourceGraphic'
                result='blur'
                stdDeviation='10'
              ></feGaussianBlur>
              <feColorMatrix
                in='blur'
                mode='matrix'
                values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7'
                result='goo'
              ></feColorMatrix>
              <feBlend in2='goo' in='SourceGraphic' result='mix'></feBlend>
            </filter>
          </defs>
        </svg>
      </div>
    )

    const Popup = () => (
      <Modal
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        show={this.state.showModal}
        onHide={this.hidePopup}
      >
        <Modal.Body>
          <h3 style={{ textAlign: 'center' }}>{this.state.textToShow}</h3>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.hidePopup} className='btn btn-success'>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )

    return (
      <div className={`App ${this.state.fontSize}`}>
        <div id='pageborder'></div>
        {this.state.isDownloading ? (
          <Loader />
        ) : (
          <div id='main'>
          <div className='font-select'>
            <span htmlFor='font'>Choose font size</span>
            <select name='font' id='font' onChange={this.handleFontChange}>
              <option value='small'>Small</option>
              <option selected value='medium'>Medium</option>
              <option value='large'>Large</option>
              <option value='extralarge'>Extra Large</option>
            </select>
          </div>
            <div className='header'>
              <div className='logo-img'>
                <img src={logo} alt='' crossOrigin='anonymous' />
                <h5 className='logo-title'>
                  honest local news for the mid columbia region
                </h5>
              </div>
              <div className='download-btn-container'>
                <div>
                  <h2 id='today-date'>{this.returnToday()}</h2>
                  <p>
                    Create your printable records by selecting items below
                  </p>
                </div>
                <div id='downloadBtn'>
                  <CustomButton
                    handleClick={this.handlePrint}
                    text='PRINT YOUR RECORDS'
                    customClass='btn-print'
                  />
                  <CustomButton
                    handleClick={this.handleDownload}
                    text='DOWNLOAD YOUR RECORDS'
                    customClass='btn-download'
                  />
                </div>
              </div>
            </div>
            <div className='hr'></div>

            <div className='main-container'>
              <div className='posts'>
                <div id='pdf-container'>
                  {this.state.posts.map((post, i) => {
                    return (
                      post.isChecked && (
                        <div key={i}>
                          <div
                            dangerouslySetInnerHTML={{ __html: post.html }}
                          />
                          <div className='pub-data'>
                            {post.publishDate} <br />
                            {post.publisher}
                          </div>
                        </div>
                      )
                    )
                  })}
                </div>

                <div id='display-container' className='noprint'>
                  {this.state.isloading ? (
                    <Loader />
                  ) : (
                    <Accordion>
                      {this.state.posts.map((post, i) => {
                        return (
                          <Accordion.Item eventKey={i} key={i}>
                            <Accordion.Header>
                              <div className='checkbox-container'>
                                <input
                                  type='checkbox'
                                  id={'checkbox_' + i}
                                  checked={post.isChecked}
                                  onChange={() => {
                                    this.handleSelectPost(post)
                                  }}
                                />
                                <label htmlFor={'checkbox_' + i}></label>
                              </div>
                              {post.title}
                            </Accordion.Header>
                            <Accordion.Body>
                              <div
                                dangerouslySetInnerHTML={{ __html: post.html }}
                              />
                              <div className='pub-data'>
                                {post.publishDate} <br />
                                {post.publisher}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        )
                      })}
                    </Accordion>
                  )}
                </div>
              </div>

              <div className='ads-data'>
                <div id='add-1' className='ads'>
                  <div className='noprint'>
                    {!this.state.isDownloading && (
                      <Adds random={this.state.adsToShow[0]} />
                    )}
                  </div>
                  {this.injectImages(this.state.adsToShow[0])}
                </div>
                <div id='hide' className='wather'>
                  <a
                    className='weatherwidget-io'
                    href='https://forecast7.com/en/45d59n121d18/the-dalles/?unit=us'
                    data-label_1='THE DALLES'
                    data-label_2='WEATHER'
                    data-theme='original'
                    data-basecolor='#3489b0'
                    data-cloudfill='#3489b0'
                    //   style='
                    //   display: block;
                    //   position: relative;
                    //   height: 211px;
                    //   padding: 0px;
                    //   overflow: hidden;
                    //   text-align: left;
                    //   text-indent: -299rem;
                    // '
                  >
                    THE DALLES WEATHER
                    <iframe
                      id='weatherwidget-io-0'
                      className='weatherwidget-io-frame'
                      title='Weather Widget'
                      scrolling='no'
                      frameBorder='0'
                      width='100%'
                      src='https://weatherwidget.io/w/'
                      //   style='
                      //   display: block;
                      //   position: absolute;
                      //   top: 0px;
                      //   height: 211px;
                      // '
                    ></iframe>
                  </a>
                </div>
                <div className='intro-text'>
                  While you're here, we have a small favour to ask...
                  <br />
                  Honest reporting on important local issues and happenings in
                  the Mid-Columbia region is vital for a vibrant economy, for
                  government accountability and to bring our communities
                  together. Local news acts as a community advocate and CCC News
                  journalists and editors are invested in the communities in
                  which they have personal stake. In other words...we live here
                  too. We’ve made it our mission to bring you, our neighbors
                  closer together by improving access to honest local news
                  through improved technology and innovation, and meaningful
                  reporting. Since the spring of 2020 we have built a service
                  that is free, carbon neutral and updated daily to over 50,000
                  monthly local readers. We miss the morning paper on our
                  doorstep and the black ink our fingers, but whether you’re
                  sitting on the porch enjoying your morning coffee, or
                  on-the-go, Columbia Community Connection is at your
                  fingertips. You can help our team of journalists continue to
                  build equity, accountability and trust to lift our communities
                  up by choosing one of our subscriptions. All subscriptions and
                  donations help us employ local journalists who work hard
                  everyday at building and maintaining this free service we can
                  all enjoy. You can find various support options at
                  CCCNews.com/frienships. Thank you, we're glad you're here with
                  us.
                </div>
                <div id='add-2' className='ads'>
                  <div className='noprint'>
                    {!this.state.isDownloading && (
                      <Adds random={this.state.adsToShow[1]} />
                    )}
                  </div>
                  {this.injectImages(this.state.adsToShow[1])}
                  <br />
                  <br />
                  <br />
                  <p>
                    Keep watching this space for news and fun additions to this
                    page
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <Popup />
      </div>
    )
  }
}
