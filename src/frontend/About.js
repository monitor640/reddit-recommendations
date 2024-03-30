import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './About.css';
import recommendation from '../assets/images/recommend.png';

const AboutPage = () => {
    return (
        <Container fluid className="about-container">
            <Row className="hero-section">
                <Col>
                    <h1>Discover Unbiased Product Recommendations</h1>
                    <p>Find what you're looking for without the SEO noise and sponsored blog posts.</p>
                </Col>
            </Row>

            <Row className="mission-statement">
                <Col>
                    <h2>Our Mission</h2>
                    <p>Empowering consumers by providing honest, community-driven product insights.</p>
                </Col>
            </Row>

            <Row className="how-it-works">
                <Col>
                    <h2>How It Works</h2>
                    <ol>
                        <li>Enter a search term in the search box.</li>
                        <li>A Google API finds the top results from Reddit.</li>
                        <li>Comments with positive sentiment are selected.</li>
                        <li>Products mentioned are identified using OpenAI API.</li>
                        <li>Links to products are provided for easy access.</li>
                    </ol>
                </Col>
            </Row>

            <Row className="testimonials">
                <Col>
                    <h2>What Our Users Say</h2>
                    <img src={recommendation} alt="Recommendation" className="recommendation-picture"/>
                </Col>
            </Row>

            <Row className="cta-section">
                <Col className="text-center">
                    <Button variant="primary" href="/">Get Started</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default AboutPage;
