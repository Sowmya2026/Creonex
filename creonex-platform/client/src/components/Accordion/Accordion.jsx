import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`accordion-item ${isOpen ? 'active' : ''}`}>
            <button className="accordion-header" onClick={onClick}>
                <span className="accordion-question">{question}</span>
                <ChevronDown className="accordion-icon" size={24} />
            </button>
            <div className="accordion-content">
                <div className="accordion-answer">{answer}</div>
            </div>
        </div>
    );
};

const Accordion = ({ items = [] }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="accordion">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onClick={() => handleToggle(index)}
                />
            ))}
        </div>
    );
};

export default Accordion;
