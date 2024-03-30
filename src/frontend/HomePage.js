import { useState } from 'react';
import { Button, Form, InputGroup, Container, Table, Spinner, Alert } from 'react-bootstrap';

export function HomePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [allProducts, setAllProducts] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const onInput = ({ target: { value } }) => setSearchTerm(value);

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            let response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchTerm })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            let products = await response.json();
            setAllProducts(products);
        } catch (error) {
            console.error('Error:', error);
            setError("Failed to fetch products. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Container className="align-content-center">
                <Form onSubmit={onSubmit}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Search something like: Best tennis racket for beginners"
                            value={searchTerm}
                            onInput={onInput}
                        />
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Search"}
                        </Button>
                    </InputGroup>
                </Form>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Container>

            {Object.keys(allProducts).length > 0 && (
                <Container fluid className="mt-3">
                    <Table striped bordered hover responsive variant="dark">
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Amount of recommendations</th>
                            <th>Link to buy</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(allProducts).map(([product, count]) => (
                            <tr key={product}>
                                <td>{product}</td>
                                <td>{count}</td>
                                <td><a href={`https://www.amazon.com/s?k=${encodeURIComponent(product)}`} target="_blank" rel="noopener noreferrer">Buy</a></td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Container>
            )}
        </Container>
    );
}
