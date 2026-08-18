<?php
/**
 * EXEMPLO DE SCRIPT PHP PARA COLOCAR NO SEU SITE (InfinityFree)
 * Salve este arquivo como 'get_questoes.php' na pasta raiz do seu site.
 *
 * Este script serve como ponte entre o App Android e o Banco MySQL.
 */

header('Content-Type: application/json');

// Configurações do Banco de Dados (usando os dados que você passou)
$host = "sql207.infinityfree.com";
$user = "if0_42534198";
$pass = "9pPyOUwYdc6Vc";
$dbname = "if0_42534198_XXX"; // Substitua XXX pelo nome real do banco

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Falha na conexão: " . $conn->connect_error]));
}

$sql = "SELECT id, titulo, descricao, resposta_correta FROM questoes";
$result = $conn->query($sql);

$questoes = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $questoes[] = $row;
    }
}

echo json_encode($questoes);

$conn->close();
?>
