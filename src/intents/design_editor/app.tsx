import {
  Button,
  Rows,
  Text,
  Title,
  FormField,
  TextInput,
  Select,
} from "@canva/app-ui-kit";
import { useState } from "react";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";
import {
  addLongTablePage,
  addPremiumPartnerSlide,
  tagElementClient,
  buyButtonClient,
  partnerCardClient,
} from "./canva_integration";

export const App = () => {
  const intl = useIntl();

  // State for Tag Element
  const [tagType, setTagType] = useState<string>("essencial");
  const [tagText, setTagText] = useState<string>("ESSENCIAL");

  // State for Buy Button
  const [btnAccent, setBtnAccent] = useState<string>("azul");
  const [btnText, setBtnText] = useState<string>("Comprar agora");

  // State for Partner Card
  const [partnerName, setPartnerName] = useState<string>("Anthonia");
  const [partnerDesc, setPartnerDesc] = useState<string>(
    "A curadoria mais charmosa de vestuário e enxoval para seu bebê."
  );
  const [partnerCode, setPartnerCode] = useState<string>("ANTHONIA15");

  // Handlers for Slides
  const handleAddTablePage = async () => {
    await addLongTablePage({
      title: "Lista de Enxoval Sugerido",
      intro: "Planeje o enxoval do bebê com itens divididos por categorias e marcas parceiras.",
      items: [
        { name: "Copo de Transição Soft", qty: "2", tag: "essencial", comment: "Bico de silicone macio", link: true },
        { name: "Babador de Silicone Impermeável", qty: "3", tag: "essencial", comment: "Fácil de limpar", link: true },
        { name: "Kit Toalha de Banho com Capuz", qty: "2", tag: "dica", comment: "Prefira algodão egípcio", link: false },
        { name: "Canguru Ergonômico Safe", qty: "1", tag: "alugar", comment: "Usar a partir dos 3 meses", link: true },
        { name: "Chupeta Ortodôntica Fase 1", qty: "2", tag: "depois", comment: "Evitar nos primeiros 15 dias", link: false }
      ]
    });
  };

  const handleAddPartnerSlide = async () => {
    await addPremiumPartnerSlide({
      partnerName,
      description: partnerDesc,
      discount: "15% OFF",
      code: partnerCode,
      link: "https://anthonia.com",
    });
  };

  // Handlers for App Elements
  const handleAddTagElement = () => {
    tagElementClient.addElement({
      data: {
        type: tagType,
        labelText: tagText,
      },
    });
  };

  const handleAddBuyButton = () => {
    buyButtonClient.addElement({
      data: {
        accent: btnAccent,
        partnerLevel: "3",
        text: btnText,
      },
    });
  };

  const handleAddPartnerCard = () => {
    partnerCardClient.addElement({
      data: {
        partnerName,
        description: partnerDesc,
        code: partnerCode,
      },
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        {/* Header */}
        <Rows spacing="0.5u">
          <Title size="medium">Johnny's by Anthonia</Title>
          <Text>
            Gere apresentações estruturadas e elementos interativos do Brand Kit diretamente no design.
          </Text>
        </Rows>

        {/* 1. PPT Slides Section */}
        <Rows spacing="1.5u">
          <Title size="small">Páginas de Apresentação (PPT)</Title>
          <Text>Crie slides estruturados de tabelas e parcerias com o visual da marca.</Text>
          <Button variant="primary" onClick={handleAddTablePage} stretch>
            Adicionar Tabela de Enxoval
          </Button>
          <Button variant="secondary" onClick={handleAddPartnerSlide} stretch>
            Adicionar Slide de Parceria
          </Button>
        </Rows>

        {/* 2. Interactive App Elements Section */}
        <Rows spacing="2u">
          <Title size="small">Elementos Interativos</Title>
          <Text>Insira badges, CTAs e cartões personalizados no design atual.</Text>

          {/* Tag Configuration */}
          <Rows spacing="1u">
            <Title size="xsmall">Tag / Badge</Title>
            <FormField
              label="Tipo de Tag"
              control={() => (
                <Select
                  value={tagType}
                  options={[
                    { value: "essencial", label: "Essencial" },
                    { value: "alugar", label: "Alugar" },
                    { value: "depois", label: "Depois" },
                    { value: "dica", label: "Dica" },
                    { value: "nao-recomendo", label: "Não Recomendo" },
                  ]}
                  onChange={setTagType}
                />
              )}
            />
            <FormField
              label="Texto do Badge"
              control={() => (
                <TextInput
                  value={tagText}
                  onChange={setTagText}
                  placeholder="EX: URGENTE"
                />
              )}
            />
            <Button variant="secondary" onClick={handleAddTagElement} stretch>
              Inserir Badge Tag
            </Button>
          </Rows>

          {/* Button Configuration */}
          <Rows spacing="1u">
            <Title size="xsmall">Botão CTA de Compra</Title>
            <FormField
              label="Cor de Destaque"
              control={() => (
                <Select
                  value={btnAccent}
                  options={[
                    { value: "azul", label: "Azul Suave" },
                    { value: "rosa", label: "Rosa Doce" },
                  ]}
                  onChange={setBtnAccent}
                />
              )}
            />
            <FormField
              label="Texto do Botão"
              control={() => (
                <TextInput
                  value={btnText}
                  onChange={setBtnText}
                  placeholder="Comprar agora"
                />
              )}
            />
            <Button variant="secondary" onClick={handleAddBuyButton} stretch>
              Inserir Botão CTA
            </Button>
          </Rows>

          {/* Card Configuration */}
          <Rows spacing="1u">
            <Title size="xsmall">Dados do Parceiro (Card / Slide)</Title>
            <FormField
              label="Nome do Parceiro"
              control={() => (
                <TextInput
                  value={partnerName}
                  onChange={setPartnerName}
                  placeholder="Anthonia"
                />
              )}
            />
            <FormField
              label="Descrição Curta"
              control={() => (
                <TextInput
                  value={partnerDesc}
                  onChange={setPartnerDesc}
                  placeholder="Descrição da marca..."
                />
              )}
            />
            <FormField
              label="Cupom de Desconto"
              control={() => (
                <TextInput
                  value={partnerCode}
                  onChange={setPartnerCode}
                  placeholder="ANTHONIA15"
                />
              )}
            />
            <Button variant="secondary" onClick={handleAddPartnerCard} stretch>
              Inserir Card de Parceria
            </Button>
          </Rows>
        </Rows>
      </Rows>
    </div>
  );
};
