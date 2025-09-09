import React from 'react'
import { Card, CardContent, CardHeader, Avatar, Typography, Stack, Rating as MuiRating } from '@mui/material'
export default function ContractorCard({ name, description, rating, reviews }:{ name:string; description:string; rating:number; reviews:number }){
  return (
    <Card variant="outlined">
      <CardHeader avatar={<Avatar />} title={name} subheader={description} />
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <MuiRating name="rating" value={rating} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary">{reviews} reviews</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
